import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Texto } from './Texto';
import { cores, raio } from './tema';

/**
 * Painel escuro de estação. Monte com `CabecalhoDoPainel` em cima, o conteúdo
 * (geralmente `Letreiro`) no meio e `RodapeDoPainel` embaixo.
 */
export function Painel({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
    return <View style={[estilos.painel, style]}>{children}</View>;
}

export function CabecalhoDoPainel({ titulo, detalhe }: { titulo: string; detalhe?: string }) {
    return (
        <View style={estilos.cabecalho}>
            <Texto variante="apoio" cor={cores.painel.textoFraco} numberOfLines={1} style={estilos.encolhe}>
                {titulo}
            </Texto>
            {detalhe ? (
                <Texto variante="mono" cor={cores.painel.textoFraco}>
                    {detalhe}
                </Texto>
            ) : null}
        </View>
    );
}

export function RodapeDoPainel({ children }: { children: React.ReactNode }) {
    return <View style={estilos.rodape}>{children}</View>;
}

const estilos = StyleSheet.create({
    painel: {
        gap: 12,
        paddingTop: 16,
        paddingHorizontal: 16,
        paddingBottom: 14,
        borderRadius: raio.cartao,
        backgroundColor: cores.painel.fundo,
    },
    cabecalho: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 12,
    },
    encolhe: { flexShrink: 1 },
    rodape: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 12,
        marginTop: 2,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: cores.painel.divisoria,
    },
});
