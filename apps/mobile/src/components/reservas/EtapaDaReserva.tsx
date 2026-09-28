import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import ScrollComTeclado from '../ScrollComTeclado';
import { Trajeto, cores, espaco } from '../../ui';

/** As etapas do fluxo de reserva, na ordem das telas. */
const PARADAS = ['Sala', 'Horário', 'Detalhes', 'Confirmar'] as const;

type Props = {
    /** Etapa atual, começando em 0 (sala). */
    etapa: number;
    /** O botão que leva à próxima etapa. */
    acao: React.ReactNode;
    /**
     * Etapa com campos de texto. O botão vai no fim do conteúdo, dentro da
     * rolagem: fixo no pé da tela, ficaria atrás do teclado aberto.
     */
    comCampos?: boolean;
    children: React.ReactNode;
};

/**
 * Moldura das telas do fluxo de reserva: o trajeto no topo, o conteúdo da
 * etapa e o botão de seguir no pé da tela, sempre à vista.
 */
export function EtapaDaReserva({ etapa, acao, comCampos = false, children }: Props) {
    const trajeto = <Trajeto paradas={PARADAS} atual={etapa} />;

    if (comCampos) {
        return (
            <ScrollComTeclado style={estilos.tela} contentContainerStyle={[estilos.conteudo, estilos.conteudoComAcao]}>
                {trajeto}
                {children}
                <View style={estilos.acaoNoFim}>{acao}</View>
            </ScrollComTeclado>
        );
    }

    return (
        <View style={estilos.tela}>
            <ScrollView style={estilos.rolagem} contentContainerStyle={estilos.conteudo}>
                {trajeto}
                {children}
            </ScrollView>
            <View style={estilos.rodape}>{acao}</View>
        </View>
    );
}

const estilos = StyleSheet.create({
    tela: { flex: 1, backgroundColor: cores.chao },
    rolagem: { flex: 1 },
    conteudo: {
        gap: espaco.xl,
        paddingHorizontal: espaco.l,
        paddingTop: espaco.s,
        paddingBottom: espaco.xxl,
    },
    // Com pouco conteúdo, o botão desce até o pé da tela, no mesmo lugar do rodapé fixo.
    conteudoComAcao: { flexGrow: 1, paddingBottom: espaco.l },
    acaoNoFim: { marginTop: 'auto' },
    rodape: {
        paddingHorizontal: espaco.l,
        paddingTop: espaco.m,
        paddingBottom: espaco.l,
        borderTopWidth: 1,
        borderTopColor: cores.linha,
        backgroundColor: cores.chao,
    },
});
