import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icone, Texto, cores, espaco, raio } from '../../ui';

/** Selo no topo das telas que vêm depois do login pelo gov.br, com a identidade já conferida. */
export function SeloDoGovbr() {
    return (
        <View style={estilos.selo} accessible accessibilityLabel="Identidade confirmada pelo gov.br">
            <Icone nome="escudo" cor={cores.sucessoTexto} tamanho={18} />
            <Texto variante="apoioForte" cor={cores.sucessoTexto} style={estilos.texto}>
                Identidade confirmada pelo gov.br
            </Texto>
        </View>
    );
}

const estilos = StyleSheet.create({
    selo: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: espaco.s,
        paddingVertical: espaco.s,
        paddingLeft: espaco.m,
        paddingRight: espaco.l,
        borderRadius: raio.controle,
        backgroundColor: cores.sucessoSuave,
    },
    texto: { flexShrink: 1 },
});
