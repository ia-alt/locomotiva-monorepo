import React, { useLayoutEffect, useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import Animated from 'react-native-reanimated';
import { Text, Surface, Dialog, Portal, Button, TextInput } from 'react-native-paper';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { PrivateStackParamList } from '../../navigation/PrivateNavigator';
import { Feather } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useORPC } from '../../locomotiva-api/context';

type Props = RouteProp<PrivateStackParamList, 'DetalhesMinhaReserva'>;

const statusConfig = {
    pending: { label: 'Aguardando aprovação', color: '#D97706', bg: '#FEF3C7', dot: true },
    confirmed: { label: 'Agendada', color: '#059669', bg: '#D1FAE5', dot: true },
    attended: { label: 'Concluída', color: '#4B5563', bg: '#F3F4F6', dot: false },
    cancelled: { label: 'Cancelada', color: '#DC2626', bg: '#FEE2E2', dot: true },
    rejected: { label: 'Rejeitada', color: '#DC2626', bg: '#FEE2E2', dot: true },
    no_show: { label: 'Não compareceu', color: '#4B5563', bg: '#F3F4F6', dot: false }
};

export default function DetalhesMinhaReservaScreen() {
    const route = useRoute<Props>();
    const navigation = useNavigation();
    const queryClient = useQueryClient();
    const { booking } = route.params;
    const orpc = useORPC();

    const [isCancelDialogVisible, setIsCancelDialogVisible] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    const { data: room, isLoading: isLoadingRoom } = useQuery(
        //@ts-ignore getRoomById queryOptions
        orpc.booking.getRoomById.queryOptions({ input: { id: booking.roomId } })
    );

    const fromDate = new Date(booking.period.from);
    const toDate = new Date(booking.period.to);

    const config = statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.pending;

    // Using the same placeholder image logic
    const roomImageUrl = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=200&h=200';

    const { mutateAsync: cancelBooking, isPending: isCanceling } = useMutation(
        //@ts-ignore cancelBooking mutationOptions
        orpc.booking.cancelBooking.mutationOptions()
    );

    const handleCancel = useCallback(() => {
        setCancelReason('');
        setIsCancelDialogVisible(true);
    }, []);

    const confirmCancel = async () => {
        setIsCancelDialogVisible(false);
        try {
            await cancelBooking({
                bookingId: booking.id,
                reason: cancelReason.trim()
            });
            await queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
            Alert.alert('Sucesso', 'Reserva cancelada com sucesso.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (e: any) {
            Alert.alert('Erro', e.message || 'Não foi possível cancelar a reserva.');
        }
    };

    useLayoutEffect(() => {
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
    }, [navigation, booking.status, isCanceling, handleCancel]);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
            <Animated.Image
                source={{ uri: roomImageUrl }}
                style={styles.headerImage}
                sharedTransitionTag={`room-image-${booking.id}`}
            />
            <Surface style={styles.card} elevation={0}>
                <View style={[styles.statusPill, { backgroundColor: config.bg, borderColor: config.bg, borderWidth: 1, alignSelf: 'flex-start' }]}>
                    {config.dot && <View style={[styles.statusDot, { backgroundColor: config.color }]} />}
                    <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
                </View>

                <Text style={styles.title}>{booking.title}</Text>
                {!!booking.description && (
                    <Text style={styles.description}>{booking.description}</Text>
                )}

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
    }
});
