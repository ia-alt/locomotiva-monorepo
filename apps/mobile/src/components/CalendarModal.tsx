import React, { useState, useMemo, useEffect } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Dimensions, useWindowDimensions } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    isSameMonth,
    isSameDay,
    isBefore,
    isToday,
    startOfDay
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CalendarModalProps {
    visible: boolean;
    onClose: () => void;
    initialDate: Date;
    onConfirm: (date: Date) => void;
}

const MAX_WIDTH = 800;

export default function CalendarModal({ visible, onClose, initialDate, onConfirm }: CalendarModalProps) {
    const { width } = useWindowDimensions();
    const modalWidth = Math.min(width, MAX_WIDTH);
    const [currentMonth, setCurrentMonth] = useState(initialDate);
    const [selectedDate, setSelectedDate] = useState(initialDate);

    // Reset focused date when modal opens
    useEffect(() => {
        if (visible) {
            setCurrentMonth(initialDate);
            setSelectedDate(initialDate);
        }
    }, [visible, initialDate]);

    const handlePreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    const weeks = useMemo(() => {
        const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 }); // Sunday as first day
        const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });

        const days = [];
        let day = start;
        // avoid infinite loops just in case, use strict date comparison
        const MAX_DAYS = 42; // Up to 6 weeks
        let cnt = 0;
        while (day <= end && cnt < MAX_DAYS) {
            days.push(day);
            day = addDays(day, 1);
            cnt++;
        }

        const weeksArray = [];
        for (let i = 0; i < days.length; i += 7) {
            weeksArray.push(days.slice(i, i + 7));
        }
        return weeksArray;
    }, [currentMonth]);

    const renderHeader = () => {
        const title = format(currentMonth, 'MMMM yyyy', { locale: ptBR });
        return (
            <View style={styles.header}>
                <TouchableOpacity onPress={handlePreviousMonth} style={styles.navButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Feather name="chevron-left" size={24} color="#1E88E5" />
                </TouchableOpacity>
                <Text style={styles.monthTitle}>{title.charAt(0).toUpperCase() + title.slice(1)}</Text>
                <TouchableOpacity onPress={handleNextMonth} style={styles.navButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Feather name="chevron-right" size={24} color="#1E88E5" />
                </TouchableOpacity>
            </View>
        );
    };

    const renderDaysOfWeek = () => {
        const days = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
        return (
            <View style={styles.daysOfWeekContainer}>
                {days.map((day) => (
                    <Text key={day} style={styles.dayOfWeekText}>{day}</Text>
                ))}
            </View>
        );
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <TouchableOpacity style={styles.touchableOverlay} activeOpacity={1} onPress={onClose} />
                <View style={[styles.modalContent, { width: modalWidth, alignSelf: 'center' }]}>

                    <View style={styles.dragHandleContainer}>
                        <View style={styles.dragHandle} />
                    </View>

                    <Text style={styles.modalTitle}>Selecionar Data</Text>

                    {renderHeader()}
                    {renderDaysOfWeek()}

                    <View style={styles.calendarBody}>
                        {weeks.map((week, idx) => (
                            <View key={idx} style={styles.weekRow}>
                                {week.map((date, dayIdx) => {
                                    const isCurrentMonth = isSameMonth(date, currentMonth);
                                    const isSelected = isSameDay(date, selectedDate);
                                    const isDateToday = isToday(date);

                                    const minValidDate = startOfDay(addDays(new Date(), 1));
                                    const isDisabled = isBefore(startOfDay(date), minValidDate);

                                    return (
                                        <TouchableOpacity
                                            key={dayIdx}
                                            style={styles.dayCellContainer}
                                            onPress={() => setSelectedDate(date)}
                                            activeOpacity={0.7}
                                            disabled={isDisabled}
                                        >
                                            <View style={[
                                                styles.dayCell,
                                                isSelected && styles.dayCellSelected,
                                                !isSelected && isDateToday && styles.dayCellToday
                                            ]}>
                                                <Text style={[
                                                    styles.dayText,
                                                    !isCurrentMonth && styles.dayTextOutside,
                                                    isDisabled && styles.dayTextDisabled,
                                                    isSelected && styles.dayTextSelected,
                                                    !isSelected && isDateToday && styles.dayTextToday
                                                ]}>
                                                    {format(date, 'd')}
                                                </Text>
                                                {!isSelected && isDateToday && (
                                                    <View style={styles.todayDot} />
                                                )}
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        ))}
                    </View>

                    <View style={styles.footer}>
                        <TouchableOpacity onPress={onClose} style={styles.cancelButton} activeOpacity={0.7}>
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => {
                            onConfirm(selectedDate);
                            onClose();
                        }} style={styles.confirmButton} activeOpacity={0.7}>
                            <Text style={styles.confirmButtonText}>Confirmar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
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
        paddingBottom: 32, // Safe area padding theoretically
        paddingTop: 12,
        minHeight: Dimensions.get('window').height * 0.7,
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
        marginBottom: 32,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
        paddingHorizontal: 12,
    },
    navButton: {
        padding: 4,
    },
    monthTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    daysOfWeekContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    dayOfWeekText: {
        width: 40,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
    },
    calendarBody: {
        marginBottom: 24,
    },
    weekRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 8,
    },
    dayCellContainer: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayCell: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 18, // Make it a circle
    },
    dayCellSelected: {
        backgroundColor: '#1E88E5',
        shadowColor: "#1E88E5",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    dayCellToday: {
        borderWidth: 1,
        borderColor: '#93C5FD',
        backgroundColor: '#FFFFFF',
    },
    dayText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
    },
    dayTextSelected: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    dayTextOutside: {
        color: '#D1D5DB',
    },
    dayTextDisabled: {
        color: '#E5E7EB',
        textDecorationLine: 'line-through',
    },
    dayTextToday: {
        color: '#1E88E5',
    },
    todayDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#1E88E5',
        position: 'absolute',
        bottom: 4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 'auto',
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
        marginLeft: 12, // Space between buttons
    },
    confirmButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFFFFF',
    }
});
