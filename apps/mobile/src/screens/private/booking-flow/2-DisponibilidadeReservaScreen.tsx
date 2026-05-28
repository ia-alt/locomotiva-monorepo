import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PrivateStackParamList } from '../../../navigation/PrivateNavigator';
import AvailabilityTimeline from '../../../components/AvailabilityTimeline';
import DateSelector from '../../../components/DateSelector';
import TimeSelector from '../../../components/TimeSelector';
import { addDays, startOfDay, addHours } from 'date-fns';
import { Feather } from '@expo/vector-icons';

type DisponibilidadeNavigationProp = NativeStackNavigationProp<PrivateStackParamList, 'DisponibilidadeReserva'>;
type DisponibilidadeRouteProp = RouteProp<PrivateStackParamList, 'DisponibilidadeReserva'>;

export default function DisponibilidadeReservaScreen() {
    const navigation = useNavigation<DisponibilidadeNavigationProp>();
    const route = useRoute<DisponibilidadeRouteProp>();
    const { roomId, roomCapacity } = route.params;

    const [selectedDate, setSelectedDate] = useState(() => startOfDay(addDays(new Date(), 1)));
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [endTime, setEndTime] = useState<Date | null>(null);
    const [blockStart, setBlockStart] = useState<Date | null>(null);
    const [blockEnd, setBlockEnd] = useState<Date | null>(null);

    const isFormValid = !!(startTime && endTime && startTime < endTime);

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
                roomId={roomId}
                date={selectedDate}
                onSelectBlock={(from, to) => {
                    setBlockStart(from);
                    setBlockEnd(to);
                    setStartTime(from);
                    const calculatedEndTime = addHours(from, 4);
                    if (calculatedEndTime > to) {
                        setEndTime(to);
                    } else {
                        setEndTime(calculatedEndTime);
                    }
                }}
            />

            <TimeSelector
                startTime={startTime}
                endTime={endTime}
                baseDate={selectedDate}
                blockStart={blockStart}
                blockEnd={blockEnd}
                onChangeStart={setStartTime}
                onChangeEnd={setEndTime}
            />

            <TouchableOpacity
                style={[styles.nextButton, !isFormValid && styles.nextButtonDisabled]}
                disabled={!isFormValid}
                onPress={() => {
                    if (startTime && endTime) {
                        navigation.navigate('DetalhesReserva', {
                            roomId,
                            roomCapacity,
                            date: selectedDate.toISOString(),
                            startTime: startTime.toISOString(),
                            endTime: endTime.toISOString(),
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
