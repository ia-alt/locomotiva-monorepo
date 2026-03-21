import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import { format, subMinutes, addMinutes } from 'date-fns';
import TimePickerModal from './TimePickerModal';

interface TimeSelectorProps {
    baseDate: Date;
    startTime: Date | null;
    endTime: Date | null;
    blockStart?: Date | null;
    blockEnd?: Date | null;
    onChangeStart: (date: Date) => void;
    onChangeEnd: (date: Date) => void;
}

export default function TimeSelector({ baseDate, startTime, endTime, blockStart, blockEnd, onChangeStart, onChangeEnd }: TimeSelectorProps) {
    const [activePicker, setActivePicker] = useState<'none' | 'start' | 'end'>('none');

    const hasError = !!(startTime && endTime && endTime <= startTime);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Horário</Text>
            <View style={styles.row}>
                <TouchableOpacity style={styles.touchableCard} onPress={() => setActivePicker('start')} activeOpacity={0.7}>
                    <Surface style={[styles.timeCard, startTime ? styles.timeCardActive : {}]} elevation={0}>
                        <Text style={styles.label}>Início</Text>
                        <View style={styles.timeDisplay}>
                            <Feather name="clock" size={16} color={startTime ? "#1E88E5" : "#9CA3AF"} />
                            <Text style={[styles.timeText, !startTime && styles.placeholder]}>
                                {startTime ? format(startTime, 'HH:mm') : '--:--'}
                            </Text>
                        </View>
                    </Surface>
                </TouchableOpacity>

                <View style={styles.divider}>
                    <Feather name="arrow-right" size={20} color="#D1D5DB" />
                </View>

                <TouchableOpacity style={styles.touchableCard} onPress={() => setActivePicker('end')} activeOpacity={0.7}>
                    <Surface style={[styles.timeCard, endTime ? styles.timeCardActive : {}, hasError ? styles.timeCardError : {}]} elevation={0}>
                        <Text style={[styles.label, hasError && styles.labelError]}>Fim</Text>
                        <View style={styles.timeDisplay}>
                            <Feather name="clock" size={16} color={hasError ? "#EF4444" : (endTime ? "#1E88E5" : "#9CA3AF")} />
                            <Text style={[styles.timeText, !endTime && styles.placeholder, hasError && styles.textError]}>
                                {endTime ? format(endTime, 'HH:mm') : '--:--'}
                            </Text>
                        </View>
                    </Surface>
                </TouchableOpacity>
            </View>

            <TimePickerModal
                visible={activePicker !== 'none'}
                onClose={() => setActivePicker('none')}
                baseDate={baseDate}
                initialTime={activePicker === 'start' ? startTime : endTime}
                title={activePicker === 'start' ? 'Horário de Início' : 'Horário de Fim'}
                minTime={
                    activePicker === 'start' 
                        ? (blockStart || undefined) 
                        : (startTime ? addMinutes(startTime, 30) : undefined)
                }
                maxTime={
                    activePicker === 'start' 
                        ? (blockEnd ? subMinutes(blockEnd, 30) : undefined)
                        : (blockEnd || undefined)
                }
                onConfirm={(date) => {
                    if (activePicker === 'start') {
                        onChangeStart(date);
                    } else if (activePicker === 'end') {
                        onChangeEnd(date);
                    }
                }}
            />
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
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    touchableCard: {
        flex: 1,
    },
    timeCard: {
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
    },
    timeCardActive: {
        borderColor: '#93C5FD',
        backgroundColor: '#EFF6FF',
    },
    timeCardError: {
        borderColor: '#FECACA',
        backgroundColor: '#FEF2F2',
    },
    label: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
        fontWeight: '500',
    },
    labelError: {
        color: '#EF4444',
    },
    timeDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    timeText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    textError: {
        color: '#EF4444',
    },
    placeholder: {
        color: '#9CA3AF',
    },
    divider: {
        paddingHorizontal: 12,
    }
});
