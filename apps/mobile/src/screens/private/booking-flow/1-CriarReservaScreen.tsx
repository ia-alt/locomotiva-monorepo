import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PrivateStackParamList } from '../../../navigation/PrivateNavigator';
import RoomSelector from '../../../components/RoomSelector';
import { Feather } from '@expo/vector-icons';

type CriarReservaNavigationProp = NativeStackNavigationProp<PrivateStackParamList, 'CriarReserva'>;

export default function CriarReservaScreen() {
    const navigation = useNavigation<CriarReservaNavigationProp>();
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
    const [selectedRoomCapacity, setSelectedRoomCapacity] = useState<number>(0);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            <View style={styles.stepIndicator}>
                <View style={styles.stepActive}><Text style={styles.stepTextActive}>1</Text></View>
                <View style={styles.stepLine} />
                <View style={styles.stepInactive}><Text style={styles.stepTextInactive}>2</Text></View>
                <View style={styles.stepLine} />
                <View style={styles.stepInactive}><Text style={styles.stepTextInactive}>3</Text></View>
            </View>

            <Text style={styles.stepLabel}>Selecione a sala desejada para a reserva.</Text>

            <RoomSelector
                selectedRoomId={selectedRoomId}
                setSelectedRoomId={(id, capacity) => {
                    setSelectedRoomId(id);
                    setSelectedRoomCapacity(capacity);
                }}
            />

            <TouchableOpacity
                style={[styles.nextButton, !selectedRoomId && styles.nextButtonDisabled]}
                disabled={!selectedRoomId}
                onPress={() => {
                    if (selectedRoomId) {
                        navigation.navigate('DisponibilidadeReserva', { roomId: selectedRoomId, roomCapacity: selectedRoomCapacity });
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
