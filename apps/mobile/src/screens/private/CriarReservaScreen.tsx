import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function CriarReservaScreen() {
    return (
        <View style={styles.container}>
            <Text variant="headlineMedium">Nova Reserva</Text>
            <Text variant="bodyMedium">Preencha os dados da reserva.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    }
});
