import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PrivateStackParamList } from '../../navigation/PrivateNavigator';
import { Feather } from '@expo/vector-icons';

type DetalhesReservaNavigationProp = NativeStackNavigationProp<PrivateStackParamList, 'DetalhesReserva'>;
type DetalhesReservaRouteProp = RouteProp<PrivateStackParamList, 'DetalhesReserva'>;

export default function DetalhesReservaScreen() {
    const navigation = useNavigation<DetalhesReservaNavigationProp>();
    const route = useRoute<DetalhesReservaRouteProp>();
    
    // We expect params from the previous screen
    const { roomId, date, startTime, endTime } = route.params;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const isFormValid = title.trim().length > 0 && description.trim().length > 0;

    const handleConfirm = () => {
        navigation.navigate('ConfirmarReserva', {
            roomId,
            date,
            startTime,
            endTime,
            title,
            description
        });
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            
            <View style={styles.headerInfo}>
                <Feather name="info" size={24} color="#1E88E5" />
                <Text style={styles.headerText}>
                    Para finalizar, informe os detalhes da atividade que ocorrerá neste horário.
                </Text>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Título da Ação</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ex: Reunião de Alinhamento"
                    placeholderTextColor="#9CA3AF"
                    value={title}
                    onChangeText={setTitle}
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Breve Descrição</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Ex: Discutir metas do trimestre com a equipe de marketing."
                    placeholderTextColor="#9CA3AF"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                />
            </View>

            <TouchableOpacity 
                style={[styles.nextButton, !isFormValid && styles.nextButtonDisabled]} 
                disabled={!isFormValid}
                onPress={handleConfirm}
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
    headerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        gap: 12,
    },
    headerText: {
        flex: 1,
        fontSize: 14,
        color: '#1E40AF',
        lineHeight: 20,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#111827',
    },
    textArea: {
        height: 120,
    },
    nextButton: {
        backgroundColor: '#1E88E5', // blue for progressing
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
