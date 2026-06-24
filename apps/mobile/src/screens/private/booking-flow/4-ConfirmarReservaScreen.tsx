import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { usePrivateStackNavigation, usePrivateStackRoute } from '../../../navigation/PrivateNavigator';
import { Feather } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { useORPC } from '../../../locomotiva-api/context';
import { onlyDateStrToLongBrDate, onlyTimeObjToTimeStr } from '../../../utils/datetime-formaters';
import { PrimaryButton } from '../../../design/components';
import { colors, spacing, radius, typography } from '../../../design/tokens';


export default function ConfirmarReservaScreen() {
    const navigation = usePrivateStackNavigation();
    const route = usePrivateStackRoute<"ConfirmarReserva">();
    const orpc = useORPC();

    const {
        room,
        day,
        startTime,
        endTime,
        title,
        description,
        numberOfPeople,
    } = route.params;

    const { mutateAsync: requestBooking } = useMutation(orpc.booking.requestBooking.mutationOptions());

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFinalConfirm = async () => {
        setIsSubmitting(true);
        try {
            // Here you'll call the actual API
            console.log("Saving reservation", {
                room,
                day,
                startTime,
                endTime,
                title,
                description
            });

            await requestBooking({
                roomId: room.id,
                day,
                timeInterval: {
                    start: startTime,
                    end: endTime,
                },
                title,
                description,
                numberOfPeople,
            });

            navigation.navigate('ReservaSucesso');

        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

            <View style={styles.titles}>
                <Text style={styles.titleText}>Confirmar Reserva</Text>
                <Text style={styles.subtitleText}>
                    Revise os dados abaixo. Se tudo estiver correto, confirme para finalizar sua reserva.
                </Text>
            </View>

            <View style={styles.highlightCard}>
                <View style={styles.highlightIcon}>
                    <Feather name="map-pin" size={20} color={colors.text.onBrand} />
                </View>
                <View style={styles.highlightTextWrap}>
                    <Text style={styles.highlightLabel}>Sala</Text>
                    <Text style={styles.highlightValue}>{room?.name}</Text>
                    <Text style={styles.highlightMeta}>
                        {onlyDateStrToLongBrDate(day)} · {onlyTimeObjToTimeStr(startTime)}–{onlyTimeObjToTimeStr(endTime)}
                    </Text>
                </View>
            </View>

            <Text style={styles.sectionLabel}>Informações da Atividade</Text>
            <View style={styles.card}>
                <View style={[styles.row, styles.rowBordered]}>
                    <Text style={styles.label}>Título</Text>
                    <Text style={styles.value}>{title}</Text>
                </View>

                <View style={[styles.row, styles.rowBordered]}>
                    <Text style={styles.label}>Pessoas</Text>
                    <Text style={styles.value}>{numberOfPeople}</Text>
                </View>

                <View style={[styles.row, styles.rowColumn]}>
                    <Text style={styles.label}>Descrição</Text>
                    <Text style={[styles.value, styles.valueColumn]}>{description}</Text>
                </View>
            </View>

            <Text style={styles.sectionLabel}>Data e Horário</Text>
            <View style={styles.card}>
                <View style={[styles.row, styles.rowBordered]}>
                    <Text style={styles.label}>Data</Text>
                    <Text style={styles.value}>
                        {onlyDateStrToLongBrDate(day)}
                    </Text>
                </View>

                <View style={[styles.row, styles.rowBordered]}>
                    <Text style={styles.label}>Início</Text>
                    <Text style={styles.value}>{onlyTimeObjToTimeStr(startTime)}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Fim</Text>
                    <Text style={styles.value}>{onlyTimeObjToTimeStr(endTime)}</Text>
                </View>
            </View>

            <Text style={styles.sectionLabel}>Local</Text>
            <View style={styles.card}>
                <View style={[styles.row, styles.rowBordered]}>
                    <Text style={styles.label}>Sala</Text>
                    <Text style={styles.value}>{room?.name}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Capacidade</Text>
                    <Text style={styles.value}>{room?.capacity}</Text>
                </View>
            </View>

            <PrimaryButton
                onPress={handleFinalConfirm}
                loading={isSubmitting}
                disabled={isSubmitting}
                icon="check"
            >
                {isSubmitting ? "Salvando..." : "Confirmar e Agendar"}
            </PrimaryButton>

        </ScrollView>
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
    highlightCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.brand.navy,
        borderRadius: radius.xl,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        gap: spacing.base,
    },
    highlightIcon: {
        width: 44,
        height: 44,
        borderRadius: radius.full,
        backgroundColor: colors.brand.blue,
        alignItems: 'center',
        justifyContent: 'center',
    },
    highlightTextWrap: {
        flex: 1,
    },
    highlightLabel: {
        fontFamily: typography.family,
        fontSize: typography.size.xs,
        fontWeight: typography.weight.semibold,
        color: colors.brand.light,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    highlightValue: {
        fontFamily: typography.family,
        fontSize: typography.size.lg,
        fontWeight: typography.weight.bold,
        color: colors.text.onBrand,
        marginTop: spacing.xs,
    },
    highlightMeta: {
        fontFamily: typography.family,
        fontSize: typography.size.sm,
        color: colors.brand.light,
        marginTop: spacing.xs,
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
    card: {
        backgroundColor: colors.surface.card,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border.subtle,
        paddingHorizontal: spacing.base,
        marginBottom: spacing.lg,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: spacing.md,
    },
    rowBordered: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border.subtle,
    },
    rowColumn: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    label: {
        fontFamily: typography.family,
        fontSize: typography.size.base,
        fontWeight: typography.weight.medium,
        color: colors.text.muted,
    },
    value: {
        fontFamily: typography.family,
        fontSize: typography.size.md,
        fontWeight: typography.weight.semibold,
        color: colors.text.primary,
        textAlign: 'right',
        flexShrink: 1,
        paddingLeft: spacing.base,
    },
    valueColumn: {
        textAlign: 'left',
        paddingLeft: 0,
        marginTop: spacing.xs,
    },
});
