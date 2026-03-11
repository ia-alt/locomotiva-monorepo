import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { addDays, format, isSameDay, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CalendarModal from './CalendarModal';

interface DateSelectorProps {
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
}

export default function DateSelector({ selectedDate, setSelectedDate }: DateSelectorProps) {
    const [modalVisible, setModalVisible] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    // Generate dates: 6 days before to 7 days after, bounded by tomorrow
    const dates = useMemo(() => {
        const baseDate = startOfDay(selectedDate);
        const minValidDate = startOfDay(addDays(new Date(), 1));
        
        let startWindow = addDays(baseDate, -6);
        if (startWindow < minValidDate) {
            startWindow = minValidDate;
        }
        
        return Array.from({ length: 14 }).map((_, i) => addDays(startWindow, i));
    }, [selectedDate]);

    // Scroll to the selected date whenever it changes
    useEffect(() => {
        const index = dates.findIndex(d => isSameDay(d, selectedDate));
        if (index !== -1 && scrollViewRef.current) {
            const itemWidth = 76; // 64 (width) + 12 (gap)
            // Center roughly by subtracting some offset
            const offset = Math.max(0, index * itemWidth - 100); 
            scrollViewRef.current.scrollTo({ x: offset, animated: true });
        }
    }, [selectedDate, dates]);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Data</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Text style={styles.link}>Ver Calendário</Text>
                </TouchableOpacity>
            </View>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {dates.map((date, index) => {
                    const isSelected = isSameDay(date, selectedDate);
                    // Format day of week - e.g. "seg", "ter", title case it normally
                    const dayOfWeek = format(date, 'eee', { locale: ptBR }).replace('.', '');
                    // Capitalize first letter
                    let formattedDayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);
                    if (formattedDayOfWeek.length > 3) {
                        formattedDayOfWeek = formattedDayOfWeek.substring(0, 3);
                    }

                    const dayOfMonth = format(date, 'dd');
                    const monthRaw = format(date, 'MMM', { locale: ptBR }).replace('.', '');
                    let formattedMonth = monthRaw.charAt(0).toUpperCase() + monthRaw.slice(1);
                    if (formattedMonth.length > 3) {
                        formattedMonth = formattedMonth.substring(0, 3);
                    }

                    return (
                        <TouchableOpacity
                            key={index}
                            activeOpacity={0.7}
                            onPress={() => setSelectedDate(date)}
                        >
                            <Surface
                                style={[
                                    styles.dateCard,
                                    isSelected && styles.dateCardSelected
                                ]}
                                elevation={0}
                            >
                                <Text style={[styles.dayOfWeekText, isSelected && styles.textSelected]}>
                                    {formattedDayOfWeek}
                                </Text>
                                <Text style={[styles.dayOfMonthText, isSelected && styles.textSelected]}>
                                    {dayOfMonth}
                                </Text>
                                <Text style={[styles.monthText, isSelected && styles.textSelected]}>
                                    {formattedMonth}
                                </Text>
                            </Surface>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            <CalendarModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                initialDate={selectedDate}
                onConfirm={(date) => setSelectedDate(date)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#374151',
    },
    link: {
        fontSize: 14,
        color: '#2563EB',
        fontWeight: '500',
    },
    scrollContent: {
        gap: 12,
        paddingBottom: 4, // for shadow
    },
    dateCard: {
        width: 64,
        height: 84,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    dateCardSelected: {
        backgroundColor: '#1E88E5', 
        borderColor: '#1E88E5',
    },
    dayOfWeekText: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 2,
    },
    dayOfMonthText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 2,
    },
    monthText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#9CA3AF',
    },
    textSelected: {
        color: '#FFFFFF',
    }
});
