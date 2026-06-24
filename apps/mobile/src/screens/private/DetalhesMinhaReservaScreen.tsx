import React, { useLayoutEffect, useCallback, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, StatusBar, Dimensions, Image } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Animated from 'react-native-reanimated';
import { Text, Surface, Dialog, Portal, Button, TextInput } from 'react-native-paper';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { PrivateStackParamList } from '../../navigation/PrivateNavigator';
import { Feather, Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useORPC } from '../../locomotiva-api/context';
import { onlyDateStrToLongBrDate, onlyTimeObjToTimeStr } from '../../utils/datetime-formaters';
import { colors, spacing, radius, typography } from '../../design/tokens';
import { PrimaryButton } from '../../design/components';

type Props = RouteProp<PrivateStackParamList, 'DetalhesMinhaReserva'>;

const statusConfig = {
    pending: { label: 'Aguardando aprovação', color: colors.feedback.warning, bg: colors.brand.light, dot: true },
    confirmed: { label: 'Agendada', color: colors.feedback.success, bg: colors.brand.light, dot: true },
    attended: { label: 'Concluída', color: colors.text.secondary, bg: colors.surface.subtle, dot: false },
    cancelled: { label: 'Cancelada', color: colors.feedback.error, bg: colors.surface.subtle, dot: true },
    rejected: { label: 'Rejeitada', color: colors.feedback.error, bg: colors.surface.subtle, dot: true },
    no_show: { label: 'Não compareceu', color: colors.text.secondary, bg: colors.surface.subtle, dot: false }
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
                            <ActivityIndicator size="small" color={colors.feedback.error} />
                        ) : (
                            <Text style={{ color: colors.feedback.error, fontFamily: typography.family, fontWeight: typography.weight.bold }}>Cancelar Reserva</Text>
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
                <ActivityIndicator size="large" color={colors.brand.navy} />
            </View>
        );
    }

    const config = statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.pending;

    return (
        <KeyboardAwareScrollView style={styles.container} contentContainerStyle={styles.scroll} enableOnAndroid={true} extraScrollHeight={20}>
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
                <View style={[styles.statusPill, { backgroundColor: config.bg }]}>
                    {config.dot && <View style={[styles.statusDot, { backgroundColor: config.color }]} />}
                    <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
                </View>

                <Text style={styles.title}>{booking.title}</Text>
                {!!booking.description && (
                    <Text style={styles.description}>{booking.description}</Text>
                )}

                <View style={styles.infoRow}>
                    <Feather name="users" size={16} color={colors.brand.blue} />
                    <Text style={styles.infoText}>
                        {booking.numberOfPeople
                            ? `Reserva para ${booking.numberOfPeople} ${booking.numberOfPeople === 1 ? 'pessoa' : 'pessoas'}`
                            : 'Quantidade de pessoas não informada'}
                    </Text>
                </View>

                {(booking.status === 'cancelled' || booking.status === 'rejected') && !!booking.rejectionCancelReason && (
                    <View style={styles.reasonBox}>
                        <Feather name="info" size={16} color={colors.feedback.error} />
                        <View style={styles.reasonContent}>
                            <Text style={styles.reasonTitle}>Motivo do cancelamento/rejeição:</Text>
                            <Text style={styles.reasonText}>{booking.rejectionCancelReason}</Text>
                        </View>
                    </View>
                )}
            </Surface>

            <Text style={styles.cardSectionTitle}>Data e Horário</Text>
            <Surface style={styles.card} elevation={0}>
                <View style={styles.infoRow}>
                    <Feather name="calendar" size={16} color={colors.brand.blue} />
                    <Text style={styles.infoText}>{onlyDateStrToLongBrDate(booking.day)}</Text>
                </View>
                <View style={[styles.infoRow, styles.infoRowLast]}>
                    <Feather name="clock" size={16} color={colors.brand.blue} />
                    <Text style={styles.infoText}>{onlyTimeObjToTimeStr(booking.timeInterval.start)} - {onlyTimeObjToTimeStr(booking.timeInterval.end)}</Text>
                </View>
            </Surface>

            <Text style={styles.cardSectionTitle}>Local</Text>
            <Surface style={styles.card} elevation={0}>
                {isLoadingRoom ? (
                    <Text style={[styles.infoText, styles.infoTextStandalone]}>Carregando sala...</Text>
                ) : (
                    <>
                        <View style={[styles.infoRow, !room?.capacity && styles.infoRowLast]}>
                            <Feather name="map-pin" size={16} color={colors.brand.blue} />
                            <Text style={styles.infoText}>{room?.name || 'Sala não encontrada'}</Text>
                        </View>
                        {!!room?.capacity && (
                            <View style={[styles.infoRow, styles.infoRowLast]}>
                                <Feather name="users" size={16} color={colors.brand.blue} />
                                <Text style={styles.infoText}>Capacidade: {room.capacity} pessoas</Text>
                            </View>
                        )}
                    </>
                )}
            </Surface>

            {(booking.status === 'pending' || booking.status === 'confirmed') && (
                <View style={styles.actionsSection}>
                    <PrimaryButton onPress={handleCancel} loading={isCanceling} disabled={isCanceling} icon="close-circle-outline">
                        Cancelar reserva
                    </PrimaryButton>
                </View>
            )}

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
                            style={{ backgroundColor: colors.surface.card }}
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setIsCancelDialogVisible(false)} textColor={colors.brand.navy}>Voltar</Button>
                        <Button
                            onPress={confirmCancel}
                            textColor={colors.feedback.error}
                            disabled={!cancelReason.trim()}
                        >
                            Sim, cancelar
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </KeyboardAwareScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.surface.background,
    },
    scroll: {
        padding: spacing.lg,
    },
    headerImage: {
        width: '100%',
        height: 200,
        borderRadius: radius.lg,
        marginBottom: -30,
    },
    card: {
        backgroundColor: colors.surface.card,
        borderRadius: radius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border.subtle,
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radius.full,
        marginBottom: spacing.base,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: radius.full,
        marginRight: spacing.xs,
    },
    statusText: {
        fontFamily: typography.family,
        fontSize: typography.size.xs,
        fontWeight: typography.weight.semibold,
    },
    title: {
        fontFamily: typography.family,
        fontSize: typography.size.xl,
        fontWeight: typography.weight.bold,
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    description: {
        fontFamily: typography.family,
        fontSize: typography.size.base,
        color: colors.text.secondary,
        marginBottom: spacing.sm,
        lineHeight: 20,
    },
    reasonBox: {
        flexDirection: 'row',
        backgroundColor: colors.surface.subtle,
        padding: spacing.md,
        borderRadius: radius.sm,
        marginTop: spacing.md,
        alignItems: 'flex-start',
    },
    reasonContent: {
        marginLeft: spacing.sm,
        flex: 1,
    },
    reasonTitle: {
        fontFamily: typography.family,
        fontSize: typography.size.sm,
        fontWeight: typography.weight.semibold,
        color: colors.feedback.error,
        marginBottom: spacing.xs / 2,
    },
    reasonText: {
        fontFamily: typography.family,
        fontSize: typography.size.sm,
        color: colors.text.secondary,
        lineHeight: 18,
    },
    cardSectionTitle: {
        fontFamily: typography.family,
        fontSize: typography.size.sm,
        fontWeight: typography.weight.bold,
        color: colors.brand.navy,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginTop: spacing.lg,
        marginBottom: spacing.md,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    infoRowLast: {
        marginBottom: 0,
    },
    infoText: {
        fontFamily: typography.family,
        fontSize: typography.size.md,
        color: colors.text.primary,
        marginLeft: spacing.sm,
        flex: 1,
    },
    infoTextStandalone: {
        marginLeft: 0,
    },
    actionsSection: {
        marginTop: spacing.lg,
    },
    expandBadge: {
        position: 'absolute',
        bottom: 36,
        right: spacing.md,
        backgroundColor: 'rgba(0,0,0,0.55)',
        borderRadius: radius.sm,
        padding: spacing.xs + 2,
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
        right: spacing.lg,
        zIndex: 10,
    },
    fullscreenImage: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT * 0.75,
    },
});
