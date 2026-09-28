import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Texto, cores, espaco } from '../../ui';

/**
 * Estas telas aparecem mais na web (a volta do gov.br passa pela página), e lá
 * a coluna do app tem até 800 px: sem limite, os botões ficariam compridos demais.
 */
const LARGURA_MAXIMA = 440;

/**
 * Telas de passagem do gov.br, sem formulário: confirmando a identidade,
 * voltando ao aplicativo, saindo da conta ou o erro. Conteúdo no meio da
 * tela, com os botões logo abaixo.
 */
export function TelaDePassagem({ children, acoes }: { children: React.ReactNode; acoes?: React.ReactNode }) {
    return (
        <View style={estilos.tela}>
            <View style={estilos.coluna}>
                {children}
                {acoes ? <View style={estilos.acoes}>{acoes}</View> : null}
            </View>
        </View>
    );
}

/** Indicador de carregamento com o que está acontecendo e, se precisar, uma orientação. */
export function Aguardando({ mensagem, explicacao }: { mensagem: string; explicacao?: string }) {
    return (
        <View style={estilos.aguardando} accessibilityLiveRegion="polite">
            <ActivityIndicator size="large" color={cores.azul} />
            <View style={estilos.textos}>
                <Texto variante="corpoGrande" style={estilos.centralizado}>
                    {mensagem}
                </Texto>
                {explicacao ? (
                    <Texto variante="explicacao" cor={cores.textoSecundario} style={estilos.centralizado}>
                        {explicacao}
                    </Texto>
                ) : null}
            </View>
        </View>
    );
}

const estilos = StyleSheet.create({
    tela: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: espaco.l,
        paddingVertical: espaco.xxl,
        backgroundColor: cores.chao,
    },
    coluna: { width: '100%', maxWidth: LARGURA_MAXIMA, alignSelf: 'center', gap: espaco.xxl },
    acoes: { gap: espaco.s },
    aguardando: { alignItems: 'center', gap: espaco.l },
    textos: { gap: espaco.s },
    centralizado: { textAlign: 'center' },
});
