import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';
import { Text, Surface } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useORPC } from '../locomotiva-api/context';
import { ORPCOutputs } from '../locomotiva-api/types';
import { onlyDateStrToBrDate, onlyTimeObjToTimeStr } from '../utils/datetime-formaters';

type Booking = ORPCOutputs["booking"]["findMyBookings"]["items"][0];

interface BookingCardProps {
    booking: Booking;
    onPressDetails: () => void;
}

const statusConfig = {
    pending: { label: 'Aguardando aprovação', color: '#D97706', bg: '#FEF3C7', dot: true },
    confirmed: { label: 'Agendado', color: '#059669', bg: '#D1FAE5', dot: true, dotColor: '#10B981' },
    attended: { label: 'Concluída', color: '#4B5563', bg: '#F3F4F6', dot: false },
    cancelled: { label: 'Cancelada', color: '#a87373ff', bg: '#FEE2E2', dot: true },
    rejected: { label: 'Rejeitada', color: '#DC2626', bg: '#FEE2E2', dot: true },
    no_show: { label: 'Não compareceu', color: '#4B5563', bg: '#F3F4F6', dot: false }
};

export default function BookingCard({ booking, onPressDetails }: BookingCardProps) {
    const orpc = useORPC();

    // Fetch room data
    const { data: room, isLoading: isLoadingRoom } = useQuery(
        //@ts-ignore getRoomById queryOptions
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
                            <Feather name="map-pin" size={12} color="#6B7280" />
                            <Text style={styles.locationText} numberOfLines={1}>
                                {room?.name || (room?.capacity ? `Capacidade: ${room.capacity}` : 'Local indisponível')}
                            </Text>
                        </View>

                        <Text style={styles.dateText}>
                            {dateFormatted} • {timeFormatted}
                        </Text>
                    </View>

                    <Feather name="chevron-right" size={20} color="#9CA3AF" />
                </View>

                <View style={styles.divider} />

                <View style={styles.footer}>
                    <View style={[styles.statusPill, { backgroundColor: config.bg, borderColor: config.bg, borderWidth: 1 }]}>
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
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    roomImage: {
        width: 60,
        height: 60,
        borderRadius: 12,
        marginRight: 12,
    },
    roomInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    roomName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    locationText: {
        fontSize: 13,
        color: '#6B7280',
        marginLeft: 4,
    },
    dateText: {
        fontSize: 13,
        color: '#4B5563',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginHorizontal: -16,
        marginBottom: 16,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    }
});
