import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { usePrivateStackNavigation, usePrivateStackRoute } from '../../../navigation/PrivateNavigator';
import AvailabilityTimeline, { AvailabilityTimelineSlot } from '../../../components/AvailabilityTimeline';
import DateSelector from '../../../components/DateSelector';
import TimeSelector from '../../../components/TimeSelector';
import { addDays, startOfDay, format } from 'date-fns';
import { Feather } from '@expo/vector-icons';
import { useORPC } from '../../../locomotiva-api/context';
import { useQuery } from '@tanstack/react-query';
import { TimePickerModalTimeValue, TimeToSeconds } from '../../../components/TimePickerModal';

export default function DisponibilidadeReservaScreen() {
    const navigation = usePrivateStackNavigation();
    const route = usePrivateStackRoute<"DisponibilidadeReserva">();
    const { room } = route.params;

    const [selectedDate, setSelectedDate] = useState(() => startOfDay(addDays(new Date(), 1)));
    const [selectedSlot, setSelectedSlot] = useState<AvailabilityTimelineSlot | null>(null);
    const [startTime, setStartTime] = useState<TimePickerModalTimeValue | null>(null);
    const [endTime, setEndTime] = useState<TimePickerModalTimeValue | null>(null);

    useEffect(() => {
        setSelectedSlot(null);
        setStartTime(null);
        setEndTime(null);
    }, [selectedDate]);

    const orpc = useORPC();
    const formattedDay = format(selectedDate, 'yyyy-MM-dd');

    // API request only triggers when roomId is valid
    const { data: availableSlots, isLoading: isLoadingSlots } = useQuery({
        ...orpc.booking.listAvailableSlotsByDay.queryOptions({
            input: { roomId: room.id, day: formattedDay }
        }),
    });

    const isFormValid = !!(startTime && endTime &&  TimeToSeconds(startTime) < TimeToSeconds(endTime));

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            <View style={styles.stepIndicator}>
                <View style={styles.stepDone}>
                    <Feather name="check" size={16} color="#FFFFFF" />
                </View>
                <View style={[styles.stepLine, styles.stepLineDone]} />
                <View style={styles.stepActive}><Text style={styles.stepTextActive}>2</Text></View>
                <View style={styles.stepLine} />
                <View style={styles.stepInactive}><Text style={styles.stepTextInactive}>3</Text></View>
            </View>

            <Text style={styles.stepLabel}>Escolha a data e o horário da reserva.</Text>

            <DateSelector
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
            />

            <AvailabilityTimeline
                isLoadingSlots={isLoadingSlots}
                availableSlots={availableSlots?.slots}
                selectedSlot={selectedSlot}
                setSelectedSlot={(slot) => {
                    setSelectedSlot(slot);
                }}
            />

            <TimeSelector
                isLoading={isLoadingSlots}
                timeSlot={selectedSlot}
                startTime={startTime}
                endTime={endTime}
                baseDate={selectedDate}
                onChangeStart={setStartTime}
                onChangeEnd={setEndTime}
            />

            <TouchableOpacity
                style={[styles.nextButton, !isFormValid && styles.nextButtonDisabled]}
                disabled={!isFormValid}
                onPress={() => {
                    if (startTime && endTime) {
                        navigation.navigate('DetalhesReserva', {
                            room,
                            day: format(selectedDate, 'yyyy-MM-dd'),
                            startTime: startTime,
                            endTime: endTime,
                        });
                    }
                }}
                activeOpacity={0.7}
            >
                <Text style={styles.nextButtonText}>Avançar</Text>
                <Feather name="arrow-right" size={20} color="#FFFFFF" />
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    stepIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    stepDone: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#10B981',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepActive: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#1E88E5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepInactive: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepLine: {
        flex: 1,
        height: 2,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 6,
    },
    stepLineDone: {
        backgroundColor: '#10B981',
    },
    stepTextActive: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    stepTextInactive: {
        color: '#9CA3AF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    stepLabel: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    nextButton: {
        backgroundColor: '#1E88E5',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        marginTop: 16,
    },
    nextButtonDisabled: {
        backgroundColor: '#9CA3AF',
    },
    nextButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
});
