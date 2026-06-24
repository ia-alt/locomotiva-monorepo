import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Text } from 'react-native-paper';
import { usePrivateStackNavigation, usePrivateStackRoute } from '../../../navigation/PrivateNavigator';
import { Feather } from '@expo/vector-icons';
import { PrimaryButton } from '../../../design/components';
import { colors, spacing, radius, typography } from '../../../design/tokens';

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
        <KeyboardAwareScrollView style={styles.container} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" enableOnAndroid={true} extraScrollHeight={20}>
            <View style={styles.stepIndicator}>
                <View style={styles.stepDone}>
                    <Feather name="check" size={16} color={colors.text.onBrand} />
                </View>
                <View style={[styles.stepLine, styles.stepLineDone]} />
                <View style={styles.stepDone}>
                    <Feather name="check" size={16} color={colors.text.onBrand} />
                </View>
                <View style={[styles.stepLine, styles.stepLineDone]} />
                <View style={styles.stepActive}><Text style={styles.stepTextActive}>3</Text></View>
            </View>

            <View style={styles.titles}>
                <Text style={styles.titleText}>Detalhes da Reserva</Text>
                <Text style={styles.subtitleText}>Informe os detalhes da atividade que ocorrerá neste horário.</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionLabel}>Atividade</Text>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Título da Ação</Text>
                    <TextInput
                        style={[styles.input, titleBelowMin && styles.inputError]}
                        placeholder="Ex: Reunião de Alinhamento"
                        placeholderTextColor={colors.text.muted}
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
                        placeholderTextColor={colors.text.muted}
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

                <View style={[styles.formGroup, styles.formGroupLast]}>
                    <Text style={styles.label}>Quantidade de Pessoas <Text style={styles.labelHint}>(máx. {room.capacity})</Text></Text>
                    <View style={styles.spinnerRow}>
                        <TouchableOpacity
                            style={[styles.spinnerButton, numberOfPeople <= 0 && styles.spinnerButtonDisabled]}
                            onPress={() => setNumberOfPeople((n) => Math.max(0, n - 1))}
                            disabled={numberOfPeople <= 0}
                            activeOpacity={0.7}
                        >
                            <Feather name="minus" size={20} color={numberOfPeople <= 0 ? colors.text.muted : colors.brand.blue} />
                        </TouchableOpacity>

                        <TextInput
                            style={styles.spinnerValue}
                            keyboardType="numeric"
                            placeholder="Não informado"
                            placeholderTextColor={colors.text.muted}
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
                            <Feather name="plus" size={20} color={numberOfPeople >= room.capacity ? colors.text.muted : colors.brand.blue} />
                        </TouchableOpacity>
                    </View>
                    {numberOfPeople === 0 && (
                        <Text style={styles.spinnerHint}>Informe quantas pessoas participarão.</Text>
                    )}
                    {numberOfPeople >= room.capacity && (
                        <Text style={[styles.spinnerHint, styles.spinnerHintWarning]}>Limite máximo da sala atingido ({room.capacity} pessoas).</Text>
                    )}
                </View>
            </View>

            <PrimaryButton
                onPress={handleConfirm}
                disabled={!isFormValid}
                icon="arrow-right"
            >
                Avançar
            </PrimaryButton>
        </KeyboardAwareScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.surface.background,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
        paddingBottom: spacing.xxl,
    },
    stepIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    stepDone: {
        width: 32,
        height: 32,
        borderRadius: radius.full,
        backgroundColor: colors.feedback.success,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepActive: {
        width: 32,
        height: 32,
        borderRadius: radius.full,
        backgroundColor: colors.brand.navy,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepLine: {
        flex: 1,
        height: 2,
        backgroundColor: colors.border.subtle,
        marginHorizontal: spacing.xs,
    },
    stepLineDone: {
        backgroundColor: colors.feedback.success,
    },
    stepTextActive: {
        fontFamily: typography.family,
        color: colors.text.onBrand,
        fontWeight: typography.weight.bold,
        fontSize: typography.size.base,
    },
    titles: {
        marginBottom: spacing.lg,
    },
    titleText: {
        fontFamily: typography.family,
        fontWeight: typography.weight.bold,
        color: colors.text.primary,
        fontSize: typography.size.xxl,
        marginBottom: spacing.xs,
    },
    subtitleText: {
        fontFamily: typography.family,
        color: colors.text.secondary,
        fontSize: typography.size.md,
        lineHeight: 22,
    },
    card: {
        backgroundColor: colors.surface.card,
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: colors.border.subtle,
        padding: spacing.lg,
        marginBottom: spacing.lg,
    },
    sectionLabel: {
        fontFamily: typography.family,
        fontWeight: typography.weight.bold,
        color: colors.brand.navy,
        fontSize: typography.size.sm,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: spacing.md,
    },
    formGroup: {
        marginBottom: spacing.lg,
    },
    formGroupLast: {
        marginBottom: 0,
    },
    label: {
        fontFamily: typography.family,
        fontSize: typography.size.base,
        fontWeight: typography.weight.semibold,
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    labelHint: {
        fontFamily: typography.family,
        color: colors.text.muted,
        fontWeight: typography.weight.regular,
        fontSize: typography.size.sm,
    },
    input: {
        backgroundColor: colors.surface.card,
        borderWidth: 1,
        borderColor: colors.border.subtle,
        borderRadius: radius.md,
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.md,
        fontFamily: typography.family,
        fontSize: typography.size.md,
        color: colors.text.primary,
    },
    textArea: {
        height: 120,
    },
    spinnerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface.card,
        borderWidth: 1,
        borderColor: colors.border.subtle,
        borderRadius: radius.md,
        overflow: 'hidden',
    },
    spinnerButton: {
        flexShrink: 0,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
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
        borderColor: colors.border.subtle,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.sm,
        fontFamily: typography.family,
        fontSize: typography.size.xl,
        fontWeight: typography.weight.bold,
        color: colors.text.primary,
        textAlign: 'center',
    },
    spinnerHint: {
        fontFamily: typography.family,
        fontSize: typography.size.xs,
        color: colors.text.muted,
        marginTop: spacing.xs,
        marginLeft: spacing.xs,
    },
    spinnerHintWarning: {
        color: colors.feedback.warning,
    },
    inputError: {
        borderColor: colors.feedback.error,
    },
    fieldFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.xs,
        paddingHorizontal: spacing.xs,
    },
    helperError: {
        fontFamily: typography.family,
        fontSize: typography.size.xs,
        color: colors.feedback.error,
    },
    counter: {
        fontFamily: typography.family,
        fontSize: typography.size.xs,
        color: colors.text.muted,
    },
    counterError: {
        color: colors.feedback.error,
    },
});
