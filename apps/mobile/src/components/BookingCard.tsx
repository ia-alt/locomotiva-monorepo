import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';
import { Text, Surface } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useORPC } from '../locomotiva-api/context';
import { ORPCOutputs } from '../locomotiva-api/types';
import { onlyDateStrToBrDate, onlyTimeObjToTimeStr } from '../utils/datetime-formaters';
import { colors, spacing, radius, typography } from '../design/tokens';

type Booking = ORPCOutputs["booking"]["findMyBookings"]["items"][0];

interface BookingCardProps {
    booking: Booking;
    onPressDetails: () => void;
}

const statusConfig = {
    pending: { label: 'Aguardando aprovação', color: colors.feedback.warning, bg: '#FEF3C7', dot: true },
    confirmed: { label: 'Agendado', color: colors.feedback.success, bg: '#D1FAE5', dot: true },
    attended: { label: 'Concluída', color: colors.text.secondary, bg: colors.surface.subtle, dot: false },
    cancelled: { label: 'Cancelada', color: colors.feedback.error, bg: '#FEE2E2', dot: true },
    rejected: { label: 'Rejeitada', color: colors.feedback.error, bg: '#FEE2E2', dot: true },
    no_show: { label: 'Não compareceu', color: colors.text.secondary, bg: colors.surface.subtle, dot: false }
};

export default function BookingCard({ booking, onPressDetails }: BookingCardProps) {
    const orpc = useORPC();

    // Fetch room data
    const { data: room, isLoading: isLoadingRoom } = useQuery(
        orpc.booking.getRoomById.queryOptions({ input: { id: booking.roomId } })
    );

    const dateFormatted = onlyDateStrToBrDate(booking.day);
    const timeFormatted = `${onlyTimeObjToTimeStr(booking.timeInterval.start)} - ${onlyTimeObjToTimeStr(booking.timeInterval.end)}`;

    const config = statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.pending;

    const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=200&h=200';
    const roomImageUrl = room?.photoUrl || FALLBACK_IMAGE;

    return (
        <Surface style={styles.card} elevation={0}>

            <TouchableOpacity onPress={onPressDetails} activeOpacity={0.7}>
                <View style={styles.header}>
                    <Animated.Image
                        source={{ uri: roomImageUrl }}
                        style={styles.roomImage}
                        sharedTransitionTag={`room-image-${booking.id}`}
                    />

                    <View style={styles.roomInfo}>
                        <Text style={styles.roomName} numberOfLines={1}>
                            {isLoadingRoom ? 'Carregando...' : booking.title || 'Sala não encontrada'}
                        </Text>

                        <View style={styles.locationRow}>
                            <Feather name="map-pin" size={12} color={colors.text.secondary} />
                            <Text style={styles.locationText} numberOfLines={1}>
                                {room?.name || (room?.capacity ? `Capacidade: ${room.capacity}` : 'Local indisponível')}
                            </Text>
                        </View>

                        <Text style={styles.dateText}>
                            {dateFormatted} • {timeFormatted}
                        </Text>
                    </View>

                    <Feather name="chevron-right" size={20} color={colors.text.muted} />
                </View>

                <View style={styles.divider} />

                <View style={styles.footer}>
                    <View style={[styles.statusPill, { backgroundColor: config.bg, borderColor: config.bg }]}>
                        {config.dot && <View style={[styles.statusDot, { backgroundColor: config.color }]} />}
                        <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Surface>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface.card,
        borderRadius: radius.lg,
        padding: spacing.base,
        marginBottom: spacing.base,
        borderWidth: 1,
        borderColor: colors.border.subtle,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.base,
    },
    roomImage: {
        width: 60,
        height: 60,
        borderRadius: radius.md,
        marginRight: spacing.md,
    },
    roomInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    roomName: {
        fontFamily: typography.family,
        fontSize: typography.size.md,
        fontWeight: typography.weight.bold,
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    locationText: {
        fontFamily: typography.family,
        fontSize: typography.size.sm,
        color: colors.text.secondary,
        marginLeft: spacing.xs,
    },
    dateText: {
        fontFamily: typography.family,
        fontSize: typography.size.sm,
        color: colors.text.secondary,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border.subtle,
        marginHorizontal: -spacing.base,
        marginBottom: spacing.base,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radius.full,
        borderWidth: 1,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: radius.full,
        marginRight: spacing.xs + 2,
    },
    statusText: {
        fontFamily: typography.family,
        fontSize: typography.size.xs,
        fontWeight: typography.weight.semibold,
    }
});
