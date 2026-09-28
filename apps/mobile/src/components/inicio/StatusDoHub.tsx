import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSituacaoDoHub } from '../../hooks/useSituacaoDoHub';
import { Sinal, Texto, cores, fontes } from '../../ui';

/** Etiqueta "Aberto / até 17:00" com o sinal verde (ou vermelho, fechado). */
export function StatusDoHub() {
    const situacao = useSituacaoDoHub();
    return (
        <View
            style={estilos.etiqueta}
            accessible
            accessibilityLabel={`Hub ${situacao.rotulo.toLowerCase()}, ${situacao.detalhe}`}
        >
            <Sinal aspecto={situacao.aberto ? 'verde' : 'vermelho'} />
            <View>
                <Texto variante="apoio" style={estilos.rotulo}>{situacao.rotulo}</Texto>
                <Texto variante="rotulo" cor={cores.textoSecundario} style={estilos.detalhe}>{situacao.detalhe}</Texto>
            </View>
        </View>
    );
}

const estilos = StyleSheet.create({
    etiqueta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 9,
        paddingVertical: 7,
        paddingLeft: 9,
        paddingRight: 12,
        borderRadius: 12,
        backgroundColor: cores.papel,
        flexShrink: 0,
    },
    rotulo: { fontFamily: fontes.negrito, lineHeight: 17 },
    detalhe: { fontFamily: fontes.regular, fontSize: 13, lineHeight: 16 },
});
