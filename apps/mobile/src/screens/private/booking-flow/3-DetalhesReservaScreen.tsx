import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Text } from 'react-native-paper';
import { usePrivateStackNavigation, usePrivateStackRoute } from '../../../navigation/PrivateNavigator';
import { Feather } from '@expo/vector-icons';

const TITLE_MIN = 3;
const TITLE_MAX = 50;
const DESC_MIN = 10;
const DESC_MAX = 200;

export default function DetalhesReservaScreen() {
    const navigation = usePrivateStackNavigation();
    const route = usePrivateStackRoute<"DetalhesReserva">();
    const { room, day, startTime, endTime } = route.params;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [numberOfPeople, setNumberOfPeople] = useState(0);


    const titleLen = title.length;
    const descLen = description.length;
    const titleBelowMin = titleLen > 0 && titleLen < TITLE_MIN;
    const descBelowMin = descLen > 0 && descLen < DESC_MIN;

    const isFormValid =
        titleLen >= TITLE_MIN &&
        descLen >= DESC_MIN &&
        numberOfPeople >= 1;

    const handleConfirm = () => {
        navigation.navigate('ConfirmarReserva', {
            room,
            day,
            startTime,
            endTime,
            title,
            description,
            numberOfPeople,
        });
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
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
                    style={[styles.input, titleBelowMin && styles.inputError]}
                    placeholder="Ex: Reunião de Alinhamento"
                    placeholderTextColor="#9CA3AF"
                    value={title}
                    onChangeText={(t) => setTitle(t.slice(0, TITLE_MAX))}
                    maxLength={TITLE_MAX}
                />
                <View style={styles.fieldFooter}>
                    {titleBelowMin ? (
                        <Text style={styles.helperError}>Escreva um pouco mais</Text>
                    ) : (
                        <Text>{''}</Text>
                    )}
                    {titleLen > 0 && (
                        <Text style={[styles.counter, titleBelowMin && styles.counterError]}>
                            {titleLen}/{TITLE_MAX}
                        </Text>
                    )}
                </View>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Breve Descrição</Text>
                <TextInput
                    style={[styles.input, styles.textArea, descBelowMin && styles.inputError]}
                    placeholder="Ex: Discutir metas do trimestre com a equipe de marketing."
                    placeholderTextColor="#9CA3AF"
                    value={description}
                    onChangeText={(t) => setDescription(t.slice(0, DESC_MAX))}
                    maxLength={DESC_MAX}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                />
                <View style={styles.fieldFooter}>
                    {descBelowMin ? (
                        <Text style={styles.helperError}>Escreva um pouco mais</Text>
                    ) : (
                        <Text>{''}</Text>
                    )}
                    {descLen > 0 && (
                        <Text style={[styles.counter, descBelowMin && styles.counterError]}>
                            {descLen}/{DESC_MAX}
                        </Text>
                    )}
                </View>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Quantidade de Pessoas <Text style={{ color: '#9CA3AF', fontWeight: '400' }}>(máx. {room.capacity})</Text></Text>
                <View style={styles.spinnerRow}>
                    <TouchableOpacity
                        style={[styles.spinnerButton, numberOfPeople <= 0 && styles.spinnerButtonDisabled]}
                        onPress={() => setNumberOfPeople((n) => Math.max(0, n - 1))}
                        disabled={numberOfPeople <= 0}
                        activeOpacity={0.7}
                    >
                        <Feather name="minus" size={20} color={numberOfPeople <= 0 ? '#D1D5DB' : '#1E88E5'} />
                    </TouchableOpacity>

                    <TextInput
                        style={styles.spinnerValue}
                        keyboardType="numeric"
                        placeholder="Não informado"
                        placeholderTextColor="#9CA3AF"
                        value={numberOfPeople === 0 ? '' : String(numberOfPeople)}
                        onChangeText={(t) => {
                            const n = parseInt(t.replace(/\D/g, ''), 10);
                            if (isNaN(n) || t === '') {
                                setNumberOfPeople(0);
                            } else {
                                setNumberOfPeople(Math.min(n, room.capacity));
                            }
                        }}
                        textAlign="center"
                    />

                    <TouchableOpacity
                        style={[styles.spinnerButton, numberOfPeople >= room.capacity && styles.spinnerButtonDisabled]}
                        onPress={() => setNumberOfPeople((n) => Math.min(room.capacity, n + 1))}
                        disabled={numberOfPeople >= room.capacity}
                        activeOpacity={0.7}
                    >
                        <Feather name="plus" size={20} color={numberOfPeople >= room.capacity ? '#D1D5DB' : '#1E88E5'} />
                    </TouchableOpacity>
                </View>
                {numberOfPeople === 0 && (
                    <Text style={styles.spinnerHint}>Informe quantas pessoas participarão.</Text>
                )}
                {numberOfPeople >= room.capacity && (
                    <Text style={[styles.spinnerHint, { color: '#F59E0B' }]}>Limite máximo da sala atingido ({room.capacity} pessoas).</Text>
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
        paddingBottom: 64,
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
        flexShrink: 0,
        paddingHorizontal: 20,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    spinnerButtonDisabled: {
        opacity: 0.4,
    },
    spinnerValue: {
        flexShrink: 1,
        flexGrow: 1,
        minWidth: 40,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#E5E7EB',
        paddingVertical: 14,
        paddingHorizontal: 8,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        textAlign: 'center',
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
    inputError: {
        borderColor: '#EF4444',
    },
    fieldFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
        paddingHorizontal: 4,
    },
    helperError: {
        fontSize: 12,
        color: '#EF4444',
    },
    counter: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    counterError: {
        color: '#EF4444',
    },
});
