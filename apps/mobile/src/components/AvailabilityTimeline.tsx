import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { useORPC } from '../locomotiva-api/context';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

interface AvailabilityTimelineProps {
    roomId: string | null;
    date: Date;
    onSelectBlock?: (from: Date, to: Date) => void;
}

const START_HOUR = 8;
const END_HOUR = 18;
const PIXELS_PER_MINUTE = 2.5; // Width scale (1 hour = 150px)
const HOUR_WIDTH = 60 * PIXELS_PER_MINUTE;

type Block = {
    id: string;
    type: 'free' | 'occupied';
    startMin: number;
    endMin: number;
    startOrigin?: Date;
    endOrigin?: Date;
    label?: string;
};

export default function AvailabilityTimeline({ roomId, date, onSelectBlock }: AvailabilityTimelineProps) {
    const orpc = useORPC();
    const formattedDay = format(date, 'yyyy-MM-dd');

    // API request only triggers when roomId is valid
    const { data: routeData, isLoading } = useQuery({
        ...orpc.booking.listAvailableSlotsByDay.queryOptions({
            input: { roomId: roomId!, day: formattedDay }
        }),
        enabled: !!roomId,
    });

    const blocks = useMemo(() => {
        if (!routeData?.slots) return [];

        const START_MINS = START_HOUR * 60;
        const END_MINS = END_HOUR * 60;

        // Process free slots
        const freeSlots = routeData.slots.map(s => {
            const startOrigin = new Date(s.from);
            const endOrigin = new Date(s.to);
            let sMin = startOrigin.getHours() * 60 + startOrigin.getMinutes();
            let eMin = endOrigin.getHours() * 60 + endOrigin.getMinutes();

            // if it goes past midnight into next day but we are local scale
            if (eMin === 0 && startOrigin.getDay() !== endOrigin.getDay()) {
                eMin = 24 * 60;
            }

            return { sMin, eMin, startOrigin, endOrigin };
        });

        freeSlots.sort((a, b) => a.sMin - b.sMin);

        // Clip the free slots to our view range [START_MINS, END_MINS]
        const clippedFreeSlots = [];
        for (const slot of freeSlots) {
            const sMin = Math.max(START_MINS, slot.sMin);
            const eMin = Math.min(END_MINS, slot.eMin);
            if (sMin < eMin) {
                clippedFreeSlots.push({ sMin, eMin, startOrigin: slot.startOrigin, endOrigin: slot.endOrigin });
            }
        }

        // Fill in the gaps as 'occupied'
        const timelineBlocks: Block[] = [];
        let curMin = START_MINS;

        clippedFreeSlots.forEach((slot, idx) => {
            if (slot.sMin > curMin) {
                timelineBlocks.push({
                    id: `occupied-${idx}`,
                    type: 'occupied',
                    startMin: curMin,
                    endMin: slot.sMin,
                    label: 'OCUPADO'
                });
            }
            timelineBlocks.push({
                id: `free-${idx}`,
                type: 'free',
                startMin: slot.sMin,
                endMin: slot.eMin,
                startOrigin: slot.startOrigin,
                endOrigin: slot.endOrigin,
                label: 'HORÁRIO LIVRE'
            });
            curMin = slot.eMin;
        });

        if (curMin < END_MINS) {
            timelineBlocks.push({
                id: `occupied-end`,
                type: 'occupied',
                startMin: curMin,
                endMin: END_MINS,
                label: 'OCUPADO'
            });
        }

        return timelineBlocks;
    }, [routeData]);

    const hoursGrid = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

    if (!roomId) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Disponibilidade</Text>
                <Surface style={styles.emptyCard} elevation={0}>
                    <Text style={{ color: '#6B7280' }}>Selecione uma sala primeiro.</Text>
                </Surface>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Disponibilidade</Text>
            <Text style={styles.instructionText}>Selecione um bloco de tempo disponível:</Text>

            <Surface style={styles.timelineWrapper} elevation={0}>
                {isLoading ? (
                    <View style={styles.loadingOver}>
                        <ActivityIndicator color="#4F46E5" />
                        <Text style={{ marginTop: 8, color: '#6B7280' }}>Buscando horários...</Text>
                    </View>
                ) : null}

                <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={styles.scrollContent}>
                    {/* Linhas da grade e horários */}
                    <View style={styles.gridContainer}>
                        {hoursGrid.map((h) => (
                            <View key={h} style={[styles.gridLine, { left: (h - START_HOUR) * HOUR_WIDTH }]}>
                                <Text style={styles.gridTimeText}>
                                    {h.toString().padStart(2, '0')}H
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Blocos de Tempo */}
                    <View style={styles.blocksContainer}>
                        {blocks.map((b) => {
                            const leftPos = (b.startMin - (START_HOUR * 60)) * PIXELS_PER_MINUTE;
                            const widthPx = (b.endMin - b.startMin) * PIXELS_PER_MINUTE;

                            // To prevent small rendering artifacts on borders:
                            const isFree = b.type === 'free';

                            return (
                                <TouchableOpacity
                                    key={b.id}
                                    style={[
                                        styles.block,
                                        { left: leftPos, width: widthPx }
                                    ]}
                                    activeOpacity={isFree ? 0.7 : 1}
                                    onPress={() => {
                                        if (isFree && onSelectBlock && b.startOrigin && b.endOrigin) {
                                            onSelectBlock(b.startOrigin, b.endOrigin);
                                        }
                                    }}
                                >
                                    <Surface
                                        style={[
                                            { flex: 1, borderRadius: 12, overflow: 'hidden' },
                                            isFree ? styles.blockFree : styles.blockOccupied
                                        ]}
                                        elevation={isFree ? 2 : 0}
                                    >
                                        <View style={styles.blockInner}>
                                            <Text style={[styles.blockLabel, isFree ? styles.textFree : styles.textOccupied]}>
                                                {b.label}
                                            </Text>
                                            {isFree && (
                                                <Text style={styles.textSubtitleFree}>
                                                    Reservar {(b.endMin - b.startMin) / 60}h
                                                </Text>
                                            )}
                                        </View>
                                    </Surface>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </ScrollView>
            </Surface>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 4,
    },
    instructionText: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 12,
        fontWeight: '500',
    },
    emptyCard: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    timelineWrapper: {
        height: 140,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        overflow: 'hidden',
        position: 'relative'
    },
    loadingOver: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.8)',
        zIndex: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        minWidth: (END_HOUR - START_HOUR) * HOUR_WIDTH,
        height: '100%',
        position: 'relative'
    },
    gridContainer: {
        ...StyleSheet.absoluteFillObject,
    },
    gridLine: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 1,
        backgroundColor: '#F3F4F6',
        justifyContent: 'flex-end',
        paddingBottom: 8,
        paddingLeft: 6,
    },
    gridTimeText: {
        fontSize: 12,
        color: '#9CA3AF',
        overflow: "visible",
        width: 24,
    },
    blocksContainer: {
        position: 'absolute',
        top: 16,
        height: 80,
        left: 0,
        right: 0,
    },
    block: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        borderRadius: 12,
        overflow: 'hidden',
    },
    blockInner: {
        flex: 1,
        padding: 8,
        justifyContent: 'center'
    },
    blockFree: {
        backgroundColor: '#E0F2FE', // Light blue
        borderWidth: 1,
        borderColor: '#BAE6FD',
        zIndex: 2,
    },
    blockOccupied: {
        backgroundColor: '#F3F4F6', // Gray filled
        opacity: 0.8,
        zIndex: 1,
    },
    blockLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    textFree: {
        color: '#0284C7',
    },
    textOccupied: {
        color: '#9CA3AF',
    },
    textSubtitleFree: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#0284C7',
    }
});
