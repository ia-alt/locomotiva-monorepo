import React, { useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import RoomSelector from '../../components/RoomSelector';
import AvailabilityTimeline from '../../components/AvailabilityTimeline';
import DateSelector from '../../components/DateSelector';
import TimeSelector from '../../components/TimeSelector';
import { addDays, startOfDay, addHours } from 'date-fns';

export default function CriarReservaScreen() {
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState(() => startOfDay(addDays(new Date(), 1)));
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [endTime, setEndTime] = useState<Date | null>(null);
    const [blockStart, setBlockStart] = useState<Date | null>(null);
    const [blockEnd, setBlockEnd] = useState<Date | null>(null);

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
