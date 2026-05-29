import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import TimePickerModal, { TimePickerModalTimeValue, TimeToSeconds } from './TimePickerModal';
import { AvailabilityTimelineSlot } from './AvailabilityTimeline';
import { onlyTimeObjToTimeStr } from '../utils/datetime-formaters';


interface TimeSelectorProps {
    timeSlot: AvailabilityTimelineSlot | null;
    isLoading: boolean;
    baseDate: Date;
    startTime: TimePickerModalTimeValue | null;
    endTime: TimePickerModalTimeValue | null;
    onChangeStart: (time: TimePickerModalTimeValue | null) => void;
    onChangeEnd: (time: TimePickerModalTimeValue | null) => void;
}

export default function TimeSelector({ baseDate, startTime, endTime, onChangeStart, onChangeEnd, isLoading, timeSlot }: TimeSelectorProps) {
    const [activePicker, setActivePicker] = useState<'none' | 'start' | 'end'>('none');
    const enabled = !!timeSlot;
    const hasError = !!(startTime && endTime && TimeToSeconds(endTime) <= TimeToSeconds(startTime));

    useEffect(() => {
        onChangeStart(null);
        onChangeEnd(null);
    }, [timeSlot]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>2. Ajuste o Horário da Reserva</Text>
            <View style={styles.row}>
                <TouchableOpacity style={[styles.touchableCard, !enabled && styles.touchableCardDisabled]} onPress={() => setActivePicker('start')} activeOpacity={0.7} disabled={!enabled}>
                    <Surface style={[styles.timeCard, startTime ? styles.timeCardActive : {}, !enabled && styles.timeCardDisabled]} elevation={0}>
                        <Text style={[styles.label, !enabled && styles.labelDisabled]}>Início</Text>
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#6B7280" />
                        ): (
                            <View style={styles.timeDisplay}>
                            <Feather name="clock" size={16} color={startTime ? "#1E88E5" : "#9CA3AF"} />
                            <Text style={[styles.timeText, !startTime && styles.placeholder]}>
                                {startTime ? onlyTimeObjToTimeStr(startTime) : '--:--'}
                            </Text>
                        </View>
                        )}
                    </Surface>
                </TouchableOpacity>

                <View style={styles.divider}>
                    <Feather name="arrow-right" size={20} color="#D1D5DB" />
                </View>

                <TouchableOpacity style={[styles.touchableCard, (!enabled || !startTime) && styles.touchableCardDisabled]} onPress={() => setActivePicker('end')} activeOpacity={0.7} disabled={!enabled || !startTime}>
                    <Surface style={[styles.timeCard, endTime ? styles.timeCardActive : {}, hasError ? styles.timeCardError : {}, (!enabled || !startTime) && styles.timeCardDisabled]} elevation={0}>
                        <Text style={[styles.label, hasError && styles.labelError, (!enabled || !startTime) && styles.labelDisabled]}>Fim</Text>
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#6B7280" />
                        ) : (
                            <View style={styles.timeDisplay}>
                                <Feather name="clock" size={16} color={hasError ? "#EF4444" : (endTime ? "#1E88E5" : "#9CA3AF")} />
                                <Text style={[styles.timeText, !endTime && styles.placeholder, hasError && styles.textError]}>
                                    {endTime ? onlyTimeObjToTimeStr(endTime) : '--:--'}
                                </Text>
                            </View>
                        )}
                    </Surface>
                </TouchableOpacity>
            </View>

            <TimePickerModal
                visible={activePicker !== 'none'}
                onClose={() => setActivePicker('none')}
                initialTime={activePicker === 'start' ? startTime : endTime}
                title={activePicker === 'start' ? 'Horário de Início' : 'Horário de Fim'}
                minTime={
                    activePicker === 'start' 
                        ? (timeSlot?.start || undefined) 
                        : (startTime ? add30Minutes(startTime) : undefined)
                }
                maxTime={
                    activePicker === 'start' 
                        ? (timeSlot?.end ? sub30Minutes(timeSlot.end) : undefined)
                        : (timeSlot?.end || undefined)
                }
                onConfirm={(time) => {
                    if (activePicker === 'start') {
                        onChangeStart(time);
                        onChangeEnd(null); // reset end time when start time changes
                    } else if (activePicker === 'end') {
                        onChangeEnd(time);
                    }
                }}
            />
        </View>
    );
}

function add30Minutes(time: TimePickerModalTimeValue): TimePickerModalTimeValue {
    let hour = time.hour;
    let minute = time.minute + 30;
    if (minute >= 60) {
        hour += 1;
        minute -= 60;
    }
    return { hour, minute, second: 0 };
}

function sub30Minutes(time: TimePickerModalTimeValue): TimePickerModalTimeValue {
    let hour = time.hour;
    let minute = time.minute - 30;
    if (minute < 0) {
        hour -= 1;
        minute += 60;
    }
    return { hour, minute, second: 0 };
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
    labelDisabled: {
        color: '#9CA3AF',
    },
    timeCardDisabled: {
        backgroundColor: '#F3F4F6',
        borderColor: '#D1D5DB',
    },
    touchableCardDisabled: {
        opacity: 0.65,
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
