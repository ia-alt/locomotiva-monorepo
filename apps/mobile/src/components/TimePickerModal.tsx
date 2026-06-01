import React, { useState, useEffect } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { format, setHours, setMinutes, startOfDay } from 'date-fns';
import { onlyTimeObjToTimeStr } from '../utils/datetime-formaters';

export type TimePickerModalTimeValue = {hour: number, minute: number, second: number};

interface TimePickerModalProps {
    visible: boolean;
    onClose: () => void;
    initialTime: TimePickerModalTimeValue | null;
    onConfirm: (time: TimePickerModalTimeValue) => void;
    title: string;
    minTime?: TimePickerModalTimeValue;
    maxTime?: TimePickerModalTimeValue;
}

const START_HOUR = 8;
const END_HOUR = 17;

export default function TimePickerModal({ visible, onClose, initialTime, onConfirm, title, minTime, maxTime }: TimePickerModalProps) {
    const [selectedTime, setSelectedTime] = useState<TimePickerModalTimeValue | null>(initialTime);

    useEffect(() => {
        if (visible) {
            setSelectedTime(initialTime);
        }
    }, [visible, initialTime]);

    // Generate timeslots every 30 mins
    const timeSlots = [];
    for (let h = START_HOUR; h <= END_HOUR; h++) {
        timeSlots.push({ hour: h, minute: 0, second: 0 });
        if (h < END_HOUR) {
            timeSlots.push({ hour: h, minute: 30, second: 0 });
        }
    }

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <TouchableOpacity style={styles.touchableOverlay} activeOpacity={1} onPress={onClose} />
                <View style={styles.modalContent}>
                    
                    <View style={styles.dragHandleContainer}>
                        <View style={styles.dragHandle} />
                    </View>
                    
                    <Text style={styles.modalTitle}>{title}</Text>

                    <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
                        <View style={styles.grid}>
                            {timeSlots.map((time, idx) => {
                                // check if same time (hour & min)
                                const isSelected = selectedTime && 
                                    time.hour === selectedTime.hour && 
                                    time.minute === selectedTime.minute;

                                // check if is disabled
                                let isDisabled = false;
                                if (minTime && TimeToSeconds(time) < TimeToSeconds(minTime)) isDisabled = true;
                                if (maxTime && TimeToSeconds(time) > TimeToSeconds(maxTime)) isDisabled = true;

                                return (
                                    <TouchableOpacity
                                        key={idx}
                                        style={[
                                            styles.timeCell, 
                                            isSelected && styles.timeCellSelected,
                                            isDisabled && styles.timeCellDisabled
                                        ]}
                                        onPress={() => !isDisabled && setSelectedTime(time)}
                                        activeOpacity={isDisabled ? 1 : 0.7}
                                    >
                                        <Text style={[
                                            styles.timeText, 
                                            isSelected && styles.timeTextSelected,
                                            isDisabled && styles.timeTextDisabled
                                        ]}>
                                            {onlyTimeObjToTimeStr(time)}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity onPress={onClose} style={styles.cancelButton} activeOpacity={0.7}>
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity onPress={() => {
                            if (selectedTime) onConfirm(selectedTime);
                            onClose();
                        }} style={[styles.confirmButton, !selectedTime && styles.confirmButtonDisabled]} activeOpacity={0.7} disabled={!selectedTime}>
                            <Text style={styles.confirmButtonText}>Confirmar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

export function TimeToSeconds(time: TimePickerModalTimeValue) {
    return time.hour * 3600 + time.minute * 60 + time.second;
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    touchableOverlay: {
        flex: 1,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingBottom: 32,
        paddingTop: 12,
        height: Dimensions.get('window').height * 0.6,
    },
    dragHandleContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    dragHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#E5E7EB',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 24,
    },
    scrollArea: {
        flex: 1,
        marginBottom: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'center',
    },
    timeCell: {
        width: '30%', // 3 columns
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    timeCellSelected: {
        backgroundColor: '#1E88E5',
        borderColor: '#1E88E5',
    },
    timeCellDisabled: {
        backgroundColor: '#F3F4F6',
        borderColor: '#E5E7EB',
    },
    timeText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#374151',
    },
    timeTextSelected: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    timeTextDisabled: {
        color: '#9CA3AF',
        textDecorationLine: 'line-through',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
    },
    cancelButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 14,
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    confirmButton: {
        flex: 1,
        backgroundColor: '#1E88E5',
        borderRadius: 12,
        alignItems: 'center',
        paddingVertical: 14,
        marginLeft: 12,
    },
    confirmButtonDisabled: {
        backgroundColor: '#93C5FD',
    },
    confirmButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFFFFF',
    }
});
