import React, { useLayoutEffect, useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, StatusBar, Dimensions, Image } from 'react-native';
import Animated from 'react-native-reanimated';
import { Text, Surface, Dialog, Portal, Button, TextInput } from 'react-native-paper';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { PrivateStackParamList } from '../../navigation/PrivateNavigator';
import { Feather, Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useORPC } from '../../locomotiva-api/context';

type Props = RouteProp<PrivateStackParamList, 'DetalhesMinhaReserva'>;

const statusConfig = {
    pending: { label: 'Aguardando aprovação', color: '#D97706', bg: '#FEF3C7', dot: true },
    confirmed: { label: 'Agendada', color: '#059669', bg: '#D1FAE5', dot: true },
    attended: { label: 'Concluída', color: '#4B5563', bg: '#F3F4F6', dot: false },
    cancelled: { label: 'Cancelada', color: '#a87373ff', bg: '#FEE2E2', dot: true },
    rejected: { label: 'Rejeitada', color: '#DC2626', bg: '#FEE2E2', dot: true },
    no_show: { label: 'Não compareceu', color: '#4B5563', bg: '#F3F4F6', dot: false }
};

export default function DetalhesMinhaReservaScreen() {
    const route = useRoute<Props>();
    const navigation = useNavigation();
    const queryClient = useQueryClient();
    const { bookingId } = route.params;
    const orpc = useORPC();

    const [isCancelDialogVisible, setIsCancelDialogVisible] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    const { data: booking, isLoading: isLoadingBooking } = useQuery(
        orpc.booking.getBookingById.queryOptions({ input: { id: bookingId } })
    );

    const { data: room, isLoading: isLoadingRoom } = useQuery({
        ...orpc.booking.getRoomById.queryOptions({ input: { id: booking?.roomId as string } }),
        enabled: !!booking?.roomId
    });

    const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=200&h=200';
    const roomImageUrl = room?.photoUrl || FALLBACK_IMAGE;
    const [imagePreviewVisible, setImagePreviewVisible] = useState(false);

    const { mutateAsync: cancelBooking, isPending: isCanceling } = useMutation({
        mutationFn: orpc.booking.cancelBooking.mutationOptions().mutationFn,
        onSuccess: () => {
            queryClient.invalidateQueries(orpc.booking.findMyBookings.key() as any);
        }
    });

    const handleCancel = useCallback(() => {
        setCancelReason('');
        setIsCancelDialogVisible(true);
    }, []);

    const confirmCancel = async () => {
        if (!booking) return;
        setIsCancelDialogVisible(false);
        try {
            await cancelBooking({
                bookingId: booking.id,
                reason: cancelReason.trim()
            });
            await queryClient.invalidateQueries(orpc.booking.findMyBookings.key() as any);

        } catch (e: any) {
            console.error(e);
        }
    };

    useLayoutEffect(() => {
        if (!booking) {
            navigation.setOptions({ headerRight: undefined });
            return;
        }
        if (booking.status === 'pending' || booking.status === 'confirmed') {
            navigation.setOptions({
                headerRight: () => (
                    <TouchableOpacity
                        onPress={handleCancel}
                        disabled={isCanceling}
                        style={{ marginRight: 8, padding: 8 }}
                    >
                        {isCanceling ? (
                            <ActivityIndicator size="small" color="#DC2626" />
                        ) : (
                            <Text style={{ color: '#DC2626', fontWeight: 'bold' }}>Cancelar Reserva</Text>
                        )}
                    </TouchableOpacity>
                ),
            });
        } else {
            navigation.setOptions({ headerRight: undefined });
        }
    }, [navigation, booking?.status, isCanceling, handleCancel]);

    if (isLoadingBooking || !booking) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#DC2626" />
            </View>
        );
    }

    const fromDate = new Date(booking.period.from);
    const toDate = new Date(booking.period.to);
    const config = statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.pending;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
            <TouchableOpacity activeOpacity={0.85} onPress={() => setImagePreviewVisible(true)}>
                <Animated.Image
                    source={{ uri: roomImageUrl }}
                    style={styles.headerImage}
                    sharedTransitionTag={`room-image-${booking.id}`}
                />
                <View style={styles.expandBadge}>
                    <Ionicons name="expand-outline" size={14} color="#fff" />
                </View>
            </TouchableOpacity>

            <Modal visible={imagePreviewVisible} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setImagePreviewVisible(false)}>
                <View style={styles.fullscreenOverlay}>
                    <StatusBar hidden />
                    <TouchableOpacity style={styles.fullscreenClose} onPress={() => setImagePreviewVisible(false)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                        <Ionicons name="close-circle" size={36} color="#fff" />
                    </TouchableOpacity>
                    <Image source={{ uri: roomImageUrl }} style={styles.fullscreenImage} resizeMode="contain" />
                </View>
            </Modal>
            <Surface style={styles.card} elevation={0}>
                <View style={[styles.statusPill, { backgroundColor: config.bg, borderColor: config.bg, borderWidth: 1, alignSelf: 'flex-start' }]}>
                    {config.dot && <View style={[styles.statusDot, { backgroundColor: config.color }]} />}
                    <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
                </View>

                <Text style={styles.title}>{booking.title}</Text>
                {!!booking.description && (
                    <Text style={styles.description}>{booking.description}</Text>
                )}

                <View style={styles.infoRow}>
                    <Feather name="users" size={16} color="#6B7280" />
                    <Text style={styles.infoText}>
                        {booking.numberOfPeople
                            ? `Reserva para ${booking.numberOfPeople} ${booking.numberOfPeople === 1 ? 'pessoa' : 'pessoas'}`
                            : 'Quantidade de pessoas não informada'}
                    </Text>
                </View>

                {(booking.status === 'cancelled' || booking.status === 'rejected') && !!booking.rejectionCancelReason && (
                    <View style={styles.reasonBox}>
                        <Feather name="info" size={16} color="#DC2626" />
                        <View style={styles.reasonContent}>
                            <Text style={styles.reasonTitle}>Motivo do cancelamento/rejeição:</Text>
                            <Text style={styles.reasonText}>{booking.rejectionCancelReason}</Text>
                        </View>
                    </View>
                )}

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>Data e Horário</Text>
                <View style={styles.infoRow}>
                    <Feather name="calendar" size={16} color="#6B7280" />
                    <Text style={styles.infoText}>{format(fromDate, "dd 'de' MMMM, yyyy", { locale: ptBR })}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Feather name="clock" size={16} color="#6B7280" />
                    <Text style={styles.infoText}>{format(fromDate, "HH:mm")} - {format(toDate, "HH:mm")}</Text>
                </View>

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>Local</Text>

                {isLoadingRoom ? (
                    <Text style={styles.infoText}>Carregando sala...</Text>
                ) : (
                    <>
                        <View style={styles.infoRow}>
                            <Feather name="map-pin" size={16} color="#6B7280" />
                            <Text style={styles.infoText}>{room?.name || 'Sala não encontrada'}</Text>
                        </View>
                        {!!room?.capacity && (
                            <View style={styles.infoRow}>
                                <Feather name="users" size={16} color="#6B7280" />
                                <Text style={styles.infoText}>Capacidade: {room.capacity} pessoas</Text>
                            </View>
                        )}
                    </>
                )}

            </Surface>

            <Portal>
                <Dialog visible={isCancelDialogVisible} onDismiss={() => setIsCancelDialogVisible(false)}>
                    <Dialog.Title>Cancelar Reserva</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
                            Tem certeza que deseja cancelar esta reserva? Por favor, justifique o motivo.
                        </Text>
                        <TextInput
                            label="Motivo do cancelamento *"
                            value={cancelReason}
                            onChangeText={setCancelReason}
                            mode="outlined"
                            multiline
                            numberOfLines={3}
                            style={{ backgroundColor: '#F9FAFB' }}
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setIsCancelDialogVisible(false)}>Voltar</Button>
                        <Button
                            onPress={confirmCancel}
                            textColor="#DC2626"
                            disabled={!cancelReason.trim()}
                        >
                            Sim, cancelar
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scroll: {
        padding: 20,
    },
    headerImage: {
        width: '100%',
        height: 200,
        borderRadius: 16,
        marginBottom: -30,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
        marginBottom: 16,
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
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: '#4B5563',
        marginBottom: 8,
        lineHeight: 20,
    },
    reasonBox: {
        flexDirection: 'row',
        backgroundColor: '#FEF2F2',
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
        alignItems: 'flex-start',
    },
    reasonContent: {
        marginLeft: 8,
        flex: 1,
    },
    reasonTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#991B1B',
        marginBottom: 2,
    },
    reasonText: {
        fontSize: 13,
        color: '#B91C1C',
        lineHeight: 18,
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoText: {
        fontSize: 16,
        color: '#374151',
        marginLeft: 8,
    },
    expandBadge: {
        position: 'absolute',
        bottom: 36,
        right: 12,
        backgroundColor: 'rgba(0,0,0,0.55)',
        borderRadius: 6,
        padding: 6,
    },
    fullscreenOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullscreenClose: {
        position: 'absolute',
        top: 48,
        right: 20,
        zIndex: 10,
    },
    fullscreenImage: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT * 0.75,
    },
});
