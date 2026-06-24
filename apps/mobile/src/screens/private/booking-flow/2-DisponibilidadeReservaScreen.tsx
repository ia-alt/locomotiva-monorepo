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
import { colors, spacing, radius, typography } from '../../../design/tokens';

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
                    <Feather name="check" size={16} color={colors.text.onBrand} />
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
                <Feather name="arrow-right" size={20} color={colors.text.onBrand} />
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.surface.background,
    },
    scrollContent: {
        padding: spacing.lg,
        paddingBottom: spacing.xl,
    },
    stepIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    stepDone: {
        width: 32,
        height: 32,
        borderRadius: radius.full,
        backgroundColor: colors.feedback.success,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepActive: {
        width: 32,
        height: 32,
        borderRadius: radius.full,
        backgroundColor: colors.brand.navy,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepInactive: {
        width: 32,
        height: 32,
        borderRadius: radius.full,
        backgroundColor: colors.surface.subtle,
        borderWidth: 1,
        borderColor: colors.border.subtle,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepLine: {
        flex: 1,
        height: 2,
        backgroundColor: colors.border.subtle,
        marginHorizontal: spacing.xs,
    },
    stepLineDone: {
        backgroundColor: colors.feedback.success,
    },
    stepTextActive: {
        fontFamily: typography.family,
        color: colors.text.onBrand,
        fontWeight: typography.weight.bold,
        fontSize: typography.size.base,
    },
    stepTextInactive: {
        fontFamily: typography.family,
        color: colors.text.muted,
        fontWeight: typography.weight.bold,
        fontSize: typography.size.base,
    },
    stepLabel: {
        fontFamily: typography.family,
        fontSize: typography.size.md,
        color: colors.text.secondary,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    nextButton: {
        backgroundColor: colors.brand.navy,
        borderRadius: radius.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.base,
        marginTop: spacing.base,
    },
    nextButtonDisabled: {
        backgroundColor: colors.border.strong,
    },
    nextButtonText: {
        fontFamily: typography.family,
        fontSize: typography.size.md,
        fontWeight: typography.weight.bold,
        color: colors.text.onBrand,
    },
});
