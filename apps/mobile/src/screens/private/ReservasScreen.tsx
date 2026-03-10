import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, FAB } from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';

export default function ReservasScreen() {
    const navigation = useNavigation<NavigationProp<any>>();

    return (
        <View style={styles.container}>
            <Text variant="headlineMedium">Reservas</Text>
            <Text variant="bodyMedium">Aqui você gerencia suas reservas.</Text>

            <FAB
                icon="plus"
                style={styles.fab}
                onPress={() => navigation.navigate('CriarReserva')}
                label='Solicitar Reserva'
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
});
