import React, { useState, useMemo } from 'react';
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

    // Generate dates starting from tomorrow for next 14 days
    const dates = useMemo(() => {
        const baseDate = startOfDay(addDays(new Date(), 1));
        return Array.from({ length: 14 }).map((_, i) => addDays(baseDate, i));
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Data</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Text style={styles.link}>Ver Calendário</Text>
                </TouchableOpacity>
            </View>
            <ScrollView
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

                    const dayOfMonth = format(date, 'd');

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
        height: 72,
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
        marginBottom: 4,
    },
    dayOfMonthText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    textSelected: {
        color: '#FFFFFF',
    }
});
