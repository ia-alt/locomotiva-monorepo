import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Dialog, Portal } from 'react-native-paper';
import { useRoute, RouteProp } from '@react-navigation/native';
import { PrivateStackParamList } from '../../navigation/PrivateNavigator';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useORPC } from '../../locomotiva-api/context';
import {
    Aviso,
    Botao,
    Cartao,
    FalhaAoCarregar,
    LinhaDeInformacao,
    SinalComRotulo,
    Texto,
    Trajeto,
    cores,
    espaco,
    raio,
} from '../../ui';
import {
    FASES_DO_PEDIDO,
    encerramentoDoPedido,
    faseDoPedido,
    situacaoDaImpressao,
} from '../../components/impressoes/situacao-da-impressao';
import { dataEHoraDoPedido } from '../../components/impressoes/datas-do-pedido';

type Props = RouteProp<PrivateStackParamList, 'DetalhesMinhaImpressao'>;

export default function DetalhesMinhaImpressaoScreen() {
    const route = useRoute<Props>();
    const queryClient = useQueryClient();
    const { printRequestId } = route.params;
    const orpc = useORPC();

    const [isCancelDialogVisible, setIsCancelDialogVisible] = useState(false);

    const { data: printRequest, isLoading, isError, refetch, isRefetching } = useQuery(
        orpc.printing.getPrintRequestById.queryOptions({ input: { printRequestId } })
    );

    const { mutateAsync: cancelPrintRequest, isPending: isCanceling } = useMutation({
        mutationFn: orpc.printing.cancelPrintRequest.mutationOptions().mutationFn,
        onSuccess: () => {
            // a lista usa a queryKey manual do ImpressoesContext; o detalhe usa a key do orpc
            queryClient.invalidateQueries({ queryKey: ['my-print-requests'] });
            queryClient.invalidateQueries({ queryKey: orpc.printing.getPrintRequestById.key({ input: { printRequestId } }) });
        },
    });

    const handleCancel = useCallback(() => setIsCancelDialogVisible(true), []);

    const confirmCancel = async () => {
        if (!printRequest) return;
        setIsCancelDialogVisible(false);
        try {
            await cancelPrintRequest({ printRequestId: printRequest.id });
        } catch (e) {
            console.error(e);
        }
    };

    if (isError && !printRequest) {
        return (
            <View style={[estilos.tela, estilos.carregando]}>
                <FalhaAoCarregar mensagem="Não foi possível carregar o pedido." aoTentarDeNovo={refetch} tentando={isRefetching} />
            </View>
        );
    }

    if (isLoading || !printRequest) {
        return (
            <View style={[estilos.tela, estilos.carregando]}>
                <ActivityIndicator size="large" color={cores.azul} accessibilityLabel="Carregando o pedido" />
            </View>
        );
    }

    const cancelable = printRequest.status === 'pending' || printRequest.status === 'approved';
    const situacao = situacaoDaImpressao(printRequest.status);
    const fase = faseDoPedido(printRequest.status);
    const encerramento = encerramentoDoPedido(printRequest.status);
    const pedidoEm = dataEHoraDoPedido(printRequest.createdAt);
    const atualizadoEm = dataEHoraDoPedido(printRequest.updatedAt);

    return (
        <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo}>
            <SinalComRotulo aspecto={situacao.sinal} rotulo={situacao.rotulo} variante="secao" />

            {fase !== null ? <Trajeto paradas={FASES_DO_PEDIDO} atual={fase} /> : null}

            {encerramento ? (
                printRequest.rejectionCancelReason ? (
                    <Aviso tom={encerramento.tom} titulo="Motivo">{printRequest.rejectionCancelReason}</Aviso>
                ) : (
                    <Aviso tom={encerramento.tom}>{encerramento.texto}</Aviso>
                )
            ) : null}

            {printRequest.status === 'completed' ? (
                <Aviso tom="sucesso">Sua impressão está pronta! Passe no Locomotiva Hub para retirá-la.</Aviso>
            ) : null}

            <Cartao titulo="Detalhes do pedido">
                <LinhaDeInformacao icone="camadas" rotulo="Material" valor={printRequest.filament.name.toUpperCase()} />
                <LinhaDeInformacao icone="impressoes" rotulo="Modelo 3D (.stl)" valor={printRequest.stlFile.name} />
                <LinhaDeInformacao icone="arquivo" rotulo="Arquivo fatiado (.gcode)" valor={printRequest.gcodeFile.name} />
                <LinhaDeInformacao
                    icone="info"
                    rotulo="Motivo da impressão"
                    valor={<Texto variante="corpo">{printRequest.purpose}</Texto>}
                />
                {pedidoEm ? <LinhaDeInformacao icone="calendario" rotulo="Pedido em" valor={pedidoEm} /> : null}
                {atualizadoEm && atualizadoEm !== pedidoEm ? (
                    <LinhaDeInformacao icone="relogio" rotulo="Última atualização" valor={atualizadoEm} />
                ) : null}
            </Cartao>

            {cancelable ? (
                <Botao titulo="Cancelar pedido" variante="perigo" onPress={handleCancel} carregando={isCanceling} />
            ) : null}

            <Portal>
                <Dialog
                    visible={isCancelDialogVisible}
                    onDismiss={() => setIsCancelDialogVisible(false)}
                    style={estilos.dialogo}
                >
                    <Dialog.Content style={estilos.conteudoDoDialogo}>
                        <Texto variante="secao" accessibilityRole="header">Cancelar pedido</Texto>
                        <Texto variante="corpo" cor={cores.textoSecundario}>
                            Tem certeza que deseja cancelar este pedido de impressão?
                        </Texto>
                        <View style={estilos.acoesDoDialogo}>
                            <Botao titulo="Sim, cancelar" onPress={confirmCancel} />
                            <Botao titulo="Voltar" variante="contorno" onPress={() => setIsCancelDialogVisible(false)} />
                        </View>
                    </Dialog.Content>
                </Dialog>
            </Portal>
        </ScrollView>
    );
}

const estilos = StyleSheet.create({
    tela: { flex: 1, backgroundColor: cores.chao },
    carregando: { justifyContent: 'center', alignItems: 'center' },
    conteudo: {
        gap: espaco.xl,
        paddingHorizontal: espaco.l,
        paddingTop: espaco.s,
        paddingBottom: espaco.xxl,
    },
    // O Dialog do Paper usaria a superfície lilás do tema padrão (MD3).
    dialogo: { borderRadius: raio.cartao, backgroundColor: cores.papel },
    conteudoDoDialogo: { gap: espaco.l },
    acoesDoDialogo: { gap: espaco.m, marginTop: espaco.xs },
});
