import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import RoomSelector from '../../components/RoomSelector';

export default function CriarReservaScreen() {
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

    return (
        <View style={styles.container}>
            <RoomSelector
                selectedRoomId={selectedRoomId}
                setSelectedRoomId={setSelectedRoomId}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F9FAFB'
    }
});
