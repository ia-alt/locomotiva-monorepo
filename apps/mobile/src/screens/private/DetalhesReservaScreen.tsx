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
    const { roomId, roomCapacity, date, startTime, endTime } = route.params;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [numberOfPeople, setNumberOfPeople] = useState(0);

    const isFormValid =
        title.trim().length > 0 &&
        description.trim().length > 0 &&
        numberOfPeople >= 1;

    const handleConfirm = () => {
        navigation.navigate('ConfirmarReserva', {
            roomId,
            date,
            startTime,
            endTime,
            title,
            description,
            numberOfPeople,
        });
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            <View style={styles.stepIndicator}>
                <View style={styles.stepDone}>
                    <Feather name="check" size={16} color="#FFFFFF" />
                </View>
                <View style={[styles.stepLine, styles.stepLineDone]} />
                <View style={styles.stepDone}>
                    <Feather name="check" size={16} color="#FFFFFF" />
                </View>
                <View style={[styles.stepLine, styles.stepLineDone]} />
                <View style={styles.stepActive}><Text style={styles.stepTextActive}>3</Text></View>
            </View>

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

            <View style={styles.formGroup}>
                <Text style={styles.label}>Quantidade de Pessoas <Text style={{ color: '#9CA3AF', fontWeight: '400' }}>(máx. {roomCapacity})</Text></Text>
                <View style={styles.spinnerRow}>
                    <TouchableOpacity
                        style={[styles.spinnerButton, numberOfPeople <= 0 && styles.spinnerButtonDisabled]}
                        onPress={() => setNumberOfPeople((n) => Math.max(0, n - 1))}
                        disabled={numberOfPeople <= 0}
                        activeOpacity={0.7}
                    >
                        <Feather name="minus" size={20} color={numberOfPeople <= 0 ? '#D1D5DB' : '#1E88E5'} />
                    </TouchableOpacity>

                    <View style={styles.spinnerValue}>
                        {numberOfPeople === 0 ? (
                            <Text style={styles.spinnerPlaceholder}>Não informado</Text>
                        ) : (
                            <Text style={styles.spinnerNumber}>{numberOfPeople}</Text>
                        )}
                    </View>

                    <TouchableOpacity
                        style={[styles.spinnerButton, numberOfPeople >= roomCapacity && styles.spinnerButtonDisabled]}
                        onPress={() => setNumberOfPeople((n) => Math.min(roomCapacity, n + 1))}
                        disabled={numberOfPeople >= roomCapacity}
                        activeOpacity={0.7}
                    >
                        <Feather name="plus" size={20} color={numberOfPeople >= roomCapacity ? '#D1D5DB' : '#1E88E5'} />
                    </TouchableOpacity>
                </View>
                {numberOfPeople === 0 && (
                    <Text style={styles.spinnerHint}>Informe quantas pessoas participarão.</Text>
                )}
                {numberOfPeople >= roomCapacity && (
                    <Text style={[styles.spinnerHint, { color: '#F59E0B' }]}>Limite máximo da sala atingido ({roomCapacity} pessoas).</Text>
                )}
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
    spinnerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        overflow: 'hidden',
    },
    spinnerButton: {
        paddingHorizontal: 20,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    spinnerButtonDisabled: {
        opacity: 0.4,
    },
    spinnerValue: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#E5E7EB',
        paddingVertical: 14,
    },
    spinnerNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    spinnerPlaceholder: {
        fontSize: 14,
        color: '#9CA3AF',
        fontStyle: 'italic',
    },
    spinnerHint: {
        fontSize: 12,
        color: '#F59E0B',
        marginTop: 6,
        marginLeft: 4,
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
