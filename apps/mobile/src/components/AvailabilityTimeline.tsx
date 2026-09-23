import React, { useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { ORPCOutputs } from '../locomotiva-api/types';
import { onlyTimeObjToTimeStr } from '../utils/datetime-formaters';

type AvailableSlots = ORPCOutputs["booking"]["listAvailableSlotsByDay"]["slots"]
export type AvailabilityTimelineSlot = AvailableSlots[0]

interface AvailabilityTimelineProps {
    availableSlots?: AvailableSlots;
    isLoadingSlots: boolean;
    selectedSlot: AvailabilityTimelineSlot | null;
    setSelectedSlot: (slot: AvailabilityTimelineSlot | null) => void;
}


export default function AvailabilityTimeline({ isLoadingSlots: isLoading, selectedSlot, setSelectedSlot, availableSlots  
 }: AvailabilityTimelineProps) {
    
    const blockWithLabel = useMemo(() => {
        if (!availableSlots) return [];


        function hourToLabel(hour: number): string {
            if (hour >= 6 && hour < 12) return 'Manhã';
            if (hour >= 12 && hour <= 18) return 'Tarde';
            if (hour > 18 && hour < 24) return 'Noite';
            return '';
        }

        return availableSlots.map(slot => {
            const startLabel = hourToLabel(slot.start.hour);
            const endLabel = hourToLabel(slot.end.hour);
            const combinedLabel = startLabel === endLabel ? startLabel : `${startLabel} & ${endLabel}`;
            return {
                slot,
                label: combinedLabel,
            };
        });
    }, [availableSlots]);


    return (
        <View style={styles.container}>
            <Text style={styles.title}>1. Escolha um período</Text>
            {isLoading ? (
                <ActivityIndicator size="small" color="#6B7280" />
            ) : (<>
                    {blockWithLabel.length > 0 && (
                        <Text style={[styles.instructionText, styles.instructionText]}>Depois de escolher o período você ajustar o horário de início e fim da sua reserva.</Text>
                    )}
                    <FlatList
                        data={blockWithLabel}
                        numColumns={2}
                        columnWrapperStyle={styles.columnWrapper}
                        scrollEnabled={false}
                        ListEmptyComponent={<Text style={styles.highlightText}>Nenhum horário disponível para o dia selecionado. <Text style={{fontWeight: 'bold', color: '#1D4ED8'}}>Tente outro dia</Text>.</Text>}
                        
                        renderItem={({ item }) => {
                            const isSelected = selectedSlot && selectedSlot.start.hour === item.slot.start.hour && selectedSlot.start.minute === item.slot.start.minute;
                            return (
                            <TouchableOpacity key={JSON.stringify(item)} onPress={() => {
                                setSelectedSlot(item.slot);
                            }} style={styles.itemContainer}>
                                <Surface style={[styles.surface, isSelected && styles.selectedSurface]}>
                                    <Text variant="bodySmall" style={isSelected && styles.selectedText}>{item.label}</Text>
                                    <Text variant="titleLarge" style={isSelected && styles.selectedText}>{onlyTimeObjToTimeStr(item.slot.start)} - {onlyTimeObjToTimeStr(item.slot.end)}</Text>
                                </Surface>
                            </TouchableOpacity>
                        );
                        }}
                    />
                    </>
                )}
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
    highlightText: {
        backgroundColor: '#EFF6FF',
        color: '#1D4ED8',
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        gap: 12,
        paddingHorizontal: 0,
    },
    itemContainer: {
        flexBasis: '50%',
        marginBottom: 12,
    },
    surface: {
        padding: 12,
        backgroundColor: '#F3F4F6',
    },
    selectedSurface: {
        backgroundColor: '#3B82F6',
        borderWidth: 2,
        borderColor: '#1E40AF',
    },
    selectedText: {
        color: '#FFFFFF',
    },
});
