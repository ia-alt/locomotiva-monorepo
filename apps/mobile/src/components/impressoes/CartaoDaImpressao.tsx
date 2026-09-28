import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useORPC } from '../../locomotiva-api/context';
import { SinalComRotulo, Texto, cores, espaco, raio, sombra } from '../../ui';
import { dataCurtaDoPedido, dataPorExtensoDoPedido } from './datas-do-pedido';
import { PedidoDeImpressao, situacaoDaImpressao } from './situacao-da-impressao';

type Props = {
    pedido: PedidoDeImpressao;
    onPress?: () => void;
};

/**
 * Um pedido de impressão na lista, na mesma superfície do bilhete de reserva:
 * motivo como título, data do pedido e material no estilo impresso, situação no sinal.
 */
export function CartaoDaImpressao({ pedido, onPress }: Props) {
    // O pedido guarda só o id do material: o nome vem do catálogo, que fica
    // em cache e serve a lista inteira com uma consulta só.
    const orpc = useORPC();
    const { data: materiais } = useQuery(orpc.printing.listFilaments.queryOptions({ input: {} }));
    const material = materiais?.find((item) => item.id === pedido.filamentId)?.name;

    const situacao = situacaoDaImpressao(pedido.status);
    const data = dataCurtaDoPedido(pedido.createdAt);
    const dataPorExtenso = dataPorExtensoDoPedido(pedido.createdAt);

    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={[
                pedido.purpose,
                material,
                dataPorExtenso ? `pedido em ${dataPorExtenso}` : null,
                situacao.rotulo,
            ].filter(Boolean).join(', ')}
            style={({ pressed }) => [estilos.cartao, pressed && estilos.pressionado]}
        >
            <View style={estilos.topo}>
                <Texto variante="destaque" numberOfLines={2} style={estilos.motivo}>
                    {pedido.purpose}
                </Texto>
                {data ? <Texto variante="mono" cor={cores.textoSecundario}>{data}</Texto> : null}
            </View>
            {material ? (
                <Texto variante="mono" cor={cores.textoSecundario} numberOfLines={1}>
                    {material.toUpperCase()}
                </Texto>
            ) : null}
            <View style={estilos.situacao}>
                <SinalComRotulo aspecto={situacao.sinal} rotulo={situacao.rotulo} />
            </View>
        </Pressable>
    );
}

const estilos = StyleSheet.create({
    cartao: {
        gap: espaco.xs,
        padding: espaco.l,
        borderRadius: raio.bilhete,
        backgroundColor: cores.papel,
        boxShadow: sombra.bilhete,
    },
    pressionado: { transform: [{ scale: 0.98 }] },
    topo: { flexDirection: 'row', alignItems: 'baseline', gap: espaco.m },
    motivo: { flex: 1 },
    situacao: { marginTop: espaco.s },
});
