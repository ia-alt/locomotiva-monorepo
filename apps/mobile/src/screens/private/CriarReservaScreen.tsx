import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PrivateStackParamList } from '../../navigation/PrivateNavigator';
import RoomSelector from '../../components/RoomSelector';
import AvailabilityTimeline from '../../components/AvailabilityTimeline';
import DateSelector from '../../components/DateSelector';
import TimeSelector from '../../components/TimeSelector';
import { addDays, startOfDay, addHours } from 'date-fns';
import { Feather } from '@expo/vector-icons';

type CriarReservaNavigationProp = NativeStackNavigationProp<PrivateStackParamList, 'CriarReserva'>;

export default function CriarReservaScreen() {
    const navigation = useNavigation<CriarReservaNavigationProp>();
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState(() => startOfDay(addDays(new Date(), 1)));
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [endTime, setEndTime] = useState<Date | null>(null);
    const [blockStart, setBlockStart] = useState<Date | null>(null);
    const [blockEnd, setBlockEnd] = useState<Date | null>(null);

    const isFormValid = !!(
        selectedRoomId &&
        selectedDate &&
        startTime &&
        endTime &&
        startTime < endTime
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            <RoomSelector
                selectedRoomId={selectedRoomId}
                setSelectedRoomId={setSelectedRoomId}
            />

            <DateSelector
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
            />

            <AvailabilityTimeline
                roomId={selectedRoomId}
                date={selectedDate}
                onSelectBlock={(from, to) => {
                    setBlockStart(from);
                    setBlockEnd(to);
                    setStartTime(from);
                    const calculatedEndTime = addHours(from, 4);
                    // if calculated end time is over block's available `to` limit, cap it
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
                    if (selectedRoomId && startTime && endTime) {
                        navigation.navigate('DetalhesReserva', {
                            roomId: selectedRoomId,
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
        backgroundColor: '#F9FAFB'
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
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
    }
});
