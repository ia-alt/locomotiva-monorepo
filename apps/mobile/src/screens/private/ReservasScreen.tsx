import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

export default function ReservasScreen() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <Text variant="headlineMedium">Reservas</Text>
            <Text variant="bodyMedium">Aqui você gerencia suas reservas.</Text>
        </View>
    );
}
