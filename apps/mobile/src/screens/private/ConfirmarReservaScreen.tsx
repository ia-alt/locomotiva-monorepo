import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PrivateStackParamList } from '../../navigation/PrivateNavigator';
import { Feather } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useORPC } from '../../locomotiva-api/context';

type ConfirmarReservaNavigationProp = NativeStackNavigationProp<PrivateStackParamList, 'ConfirmarReserva'>;
type ConfirmarReservaRouteProp = RouteProp<PrivateStackParamList, 'ConfirmarReserva'>;

export default function ConfirmarReservaScreen() {
    const navigation = useNavigation<ConfirmarReservaNavigationProp>();
    const route = useRoute<ConfirmarReservaRouteProp>();
    const orpc = useORPC();

    const {
        roomId,
        date,
        startTime,
        endTime,
        title,
        description,
        numberOfPeople,
    } = route.params;

    const { data: room } = useQuery(orpc.booking.getRoomById.queryOptions({ input: { id: roomId } }))
    const { mutateAsync: requestBooking } = useMutation(orpc.booking.requestBooking.mutationOptions());

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFinalConfirm = async () => {
        setIsSubmitting(true);
        try {
            // Here you'll call the actual API
            console.log("Saving reservation", {
                roomId,
                date,
                startTime,
                endTime,
                title,
                description
            });

            await requestBooking({
                roomId,
                period: {
                    from: startTime,
                    to: endTime,
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

    const parsedDate = date ? new Date(date) : new Date();
    const parsedStart = startTime ? new Date(startTime) : new Date();
    const parsedEnd = endTime ? new Date(endTime) : new Date();

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

            <View style={styles.headerInfo}>
                <Feather name="check-circle" size={24} color="#1E88E5" />
                <Text style={styles.headerText}>
                    Revise os dados abaixo. Se tudo estiver correto, confirme para finalizar sua reserva.
                </Text>
            </View>

            <Surface style={styles.card} elevation={0}>
                <Text style={styles.cardTitle}>Informações da Atividade</Text>

                <View style={styles.row}>
                    <Text style={styles.label}>Título:</Text>
                    <Text style={styles.value}>{title}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Pessoas:</Text>
                    <Text style={styles.value}>{numberOfPeople}</Text>
                </View>

                <View style={[styles.row, { borderBottomWidth: 0, paddingBottom: 0, flexDirection: 'column', alignItems: 'flex-start' }]}>
                    <Text style={styles.label}>Descrição:</Text>
                    <Text style={[styles.value, { marginTop: 4 }]}>{description}</Text>
                </View>
            </Surface>

            <Surface style={styles.card} elevation={0}>
                <Text style={styles.cardTitle}>Data e Horário</Text>

                <View style={styles.row}>
                    <Text style={styles.label}>Data:</Text>
                    <Text style={styles.value}>
                        {format(parsedDate, "dd 'de' MMMM, yyyy", { locale: ptBR })}
                    </Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Início:</Text>
                    <Text style={styles.value}>{format(parsedStart, 'HH:mm')}</Text>
                </View>

                <View style={[styles.row, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                    <Text style={styles.label}>Fim:</Text>
                    <Text style={styles.value}>{format(parsedEnd, 'HH:mm')}</Text>
                </View>
            </Surface>

            {/* If we had room name we could show it nicely, here we just show ID or "Sala Selecionada" */}
            <Surface style={styles.card} elevation={0}>
                <Text style={styles.cardTitle}>Local</Text>
                <View style={[styles.row, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                    <Text style={styles.label}>Sala:</Text>
                    <Text style={styles.value}>{room?.name}</Text>
                </View>
                <View style={[styles.row, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                    <Text style={styles.label}>Capacidade:</Text>
                    <Text style={styles.value}>{room?.capacity}</Text>
                </View>
            </Surface>

            <TouchableOpacity
                style={[styles.confirmButton, isSubmitting && styles.confirmButtonDisabled]}
                disabled={isSubmitting}
                onPress={handleFinalConfirm}
                activeOpacity={0.7}
            >
                <Feather name="check" size={20} color="#FFFFFF" />
                <Text style={styles.confirmButtonText}>
                    {isSubmitting ? "Salvando..." : "Confirmar e Agendar"}
                </Text>
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
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        paddingBottom: 12,
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
    },
    value: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        textAlign: 'right',
        flexShrink: 1,
        paddingLeft: 16,
    },
    confirmButton: {
        backgroundColor: '#10B981', // green for confirm
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        marginTop: 16,
    },
    confirmButtonDisabled: {
        backgroundColor: '#D1D5DB',
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    }
});
