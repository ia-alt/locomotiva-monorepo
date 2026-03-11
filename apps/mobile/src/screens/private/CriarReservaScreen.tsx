import React, { useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import RoomSelector from '../../components/RoomSelector';
import AvailabilityTimeline from '../../components/AvailabilityTimeline';
import DateSelector from '../../components/DateSelector';
import { addDays, startOfDay } from 'date-fns';

export default function CriarReservaScreen() {
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState(() => startOfDay(addDays(new Date(), 1)));

    return (
        <ScrollView style={styles.container}>
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
                    console.log("Selected block from", from, "to", to);
                }}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F9FAFB'
    }
});
