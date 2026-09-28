import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DialogComTeclado from '../../components/DialogComTeclado';
import { usePrivateStackRoute } from '../../navigation/PrivateNavigator';
import { useORPC } from '../../locomotiva-api/context';
import { onlyDateStrToLongBrDate, onlyTimeObjToTimeStr } from '../../utils/datetime-formaters';
import { HorarioFuncionamentoCard } from '../../components/HorarioFuncionamentoCard';
import { BilheteDaReserva } from '../../components/reservas/BilheteDaReserva';
import { CartaoDaSala } from '../../components/reservas/CartaoDaSala';
import { Aviso, Botao, Campo, Cartao, FalhaAoCarregar, LinhaDeInformacao, Texto, cores, espaco, raio } from '../../ui';
import { reservaEstaDePe } from '../../components/reservas/situacao-da-reserva';

export default function DetalhesMinhaReservaScreen() {
    const route = usePrivateStackRoute<'DetalhesMinhaReserva'>();
    const queryClient = useQueryClient();
    const { bookingId } = route.params;
    const orpc = useORPC();

    const [isCancelDialogVisible, setIsCancelDialogVisible] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    const { data: booking, isLoading: isLoadingBooking, isError, refetch, isRefetching } = useQuery(
        orpc.booking.getBookingById.queryOptions({ input: { id: bookingId } })
    );

    const { data: room, isLoading: isLoadingRoom } = useQuery({
        ...orpc.booking.getRoomById.queryOptions({ input: { id: booking?.roomId as string } }),
        enabled: !!booking?.roomId
    });

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

    if (isError && !booking) {
        return (
            <View style={[estilos.tela, estilos.carregando]}>
                <FalhaAoCarregar mensagem="Não foi possível carregar a reserva." aoTentarDeNovo={refetch} tentando={isRefetching} />
            </View>
        );
    }

    if (isLoadingBooking || !booking) {
        return (
            <View style={[estilos.tela, estilos.carregando]}>
                <ActivityIndicator size="large" color={cores.azul} accessibilityLabel="Carregando a reserva" />
            </View>
        );
    }

    // Só dá para cancelar o que ainda vai acontecer (aguardando ou confirmada).
    const podeCancelar = reservaEstaDePe(booking);
    const motivo = (booking.status === 'cancelled' || booking.status === 'rejected') && !!booking.rejectionCancelReason
        ? booking.rejectionCancelReason
        : null;
    const pessoas = booking.numberOfPeople
        ? `Reserva para ${booking.numberOfPeople} ${booking.numberOfPeople === 1 ? 'pessoa' : 'pessoas'}`
        : 'Quantidade de pessoas não informada';

    return (
        <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo}>
            <BilheteDaReserva reserva={booking} />

            {motivo ? (
                <Aviso tom="erro" titulo={booking.status === 'rejected' ? 'Motivo da rejeição' : 'Motivo do cancelamento'}>
                    {motivo}
                </Aviso>
            ) : null}

            <Cartao titulo="Sobre a reserva">
                <View style={estilos.atividade}>
                    <Texto variante="destaque">{booking.title}</Texto>
                    {!!booking.description && (
                        <Texto variante="corpo" cor={cores.textoSecundario}>{booking.description}</Texto>
                    )}
                </View>
                <LinhaDeInformacao icone="pessoas" rotulo="Pessoas" valor={pessoas} />
                <LinhaDeInformacao icone="calendario" rotulo="Data" valor={onlyDateStrToLongBrDate(booking.day)} />
                <LinhaDeInformacao
                    icone="relogio"
                    rotulo="Horário"
                    valor={`${onlyTimeObjToTimeStr(booking.timeInterval.start)} às ${onlyTimeObjToTimeStr(booking.timeInterval.end)}`}
                />
            </Cartao>

            {isLoadingRoom ? (
                <Cartao titulo="Local">
                    <Texto variante="apoio" cor={cores.textoSecundario}>Carregando sala...</Texto>
                </Cartao>
            ) : (
                <CartaoDaSala
                    nome={room?.name || 'Sala não encontrada'}
                    capacidade={room?.capacity || undefined}
                    descricao={room?.description}
                    photoUrl={room?.photoUrl}
                >
                    <HorarioFuncionamentoCard />
                </CartaoDaSala>
            )}

            {podeCancelar ? (
                <Botao titulo="Cancelar reserva" variante="perigo" onPress={handleCancel} carregando={isCanceling} />
            ) : null}

            <DialogComTeclado
                visible={isCancelDialogVisible}
                onDismiss={() => setIsCancelDialogVisible(false)}
                style={estilos.dialogo}
            >
                <View style={estilos.conteudoDoDialogo}>
                    <Texto variante="secao" accessibilityRole="header">Cancelar reserva</Texto>
                    <Texto variante="explicacao" cor={cores.textoSecundario}>
                        Tem certeza que deseja cancelar esta reserva? Por favor, justifique o motivo.
                    </Texto>
                    <Campo
                        rotulo="Motivo do cancelamento"
                        value={cancelReason}
                        onChangeText={setCancelReason}
                        multiline
                        numberOfLines={3}
                    />
                    <View style={estilos.acoesDoDialogo}>
                        <Botao titulo="Sim, cancelar" onPress={confirmCancel} desabilitado={!cancelReason.trim()} />
                        <Botao titulo="Voltar" variante="contorno" onPress={() => setIsCancelDialogVisible(false)} />
                    </View>
                </View>
            </DialogComTeclado>
        </ScrollView>
    );
}

const estilos = StyleSheet.create({
    tela: { flex: 1, backgroundColor: cores.chao },
    carregando: { alignItems: 'center', justifyContent: 'center' },
    // Folga em cima para a sombra e os entalhes do bilhete não serem cortados pela rolagem.
    conteudo: {
        gap: espaco.xl,
        paddingHorizontal: espaco.l,
        paddingTop: espaco.l,
        paddingBottom: espaco.xxl,
    },
    atividade: { gap: espaco.xs },
    // O Dialog do Paper usaria a superfície lilás do tema padrão (MD3).
    dialogo: { borderRadius: raio.cartao, backgroundColor: cores.papel },
    // O Dialog do Paper põe margem em cima do primeiro filho; aqui o espaço vem do padding.
    conteudoDoDialogo: { marginTop: 0, gap: espaco.l, padding: espaco.xxl },
    acoesDoDialogo: { gap: espaco.m, marginTop: espaco.xs },
});
