import React from 'react';
import { StyleSheet, View } from 'react-native';
import ScrollComTeclado from '../ScrollComTeclado';
import { Texto, cores, espaco } from '../../ui';

type Props = {
    /** Faixa de ponta a ponta acima do conteúdo: a `BarraDeVoltar` ou a marca. */
    topo?: React.ReactNode;
    children: React.ReactNode;
    id?: string;
};

/**
 * Esqueleto das telas de acesso com formulário (login, cadastro, senha e o
 * cadastro pelo gov.br). Rola até o campo focado com o teclado aberto e
 * empilha título, campos e ações sempre com o mesmo respiro.
 */
export function TelaDeAcesso({ topo, children, id }: Props) {
    return (
        <ScrollComTeclado
            id={id}
            style={estilos.tela}
            contentContainerStyle={estilos.conteudo}
            showsVerticalScrollIndicator={false}
        >
            {topo}
            <View style={[estilos.miolo, !topo && estilos.mioloSemTopo]}>{children}</View>
        </ScrollComTeclado>
    );
}

type PropsDoTitulo = {
    titulo: string;
    explicacao?: string;
    /** `saudacao` quando o título cumprimenta a pessoa pelo nome, como no início. */
    variante?: 'titulo' | 'saudacao';
};

/** Título da tela com a frase curta que explica o que fazer nela. */
export function TituloDaTela({ titulo, explicacao, variante = 'titulo' }: PropsDoTitulo) {
    return (
        <View style={estilos.titulo}>
            <Texto variante={variante} accessibilityRole="header">
                {titulo}
            </Texto>
            {explicacao ? (
                <Texto variante="explicacao" cor={cores.textoSecundario}>
                    {explicacao}
                </Texto>
            ) : null}
        </View>
    );
}

const estilos = StyleSheet.create({
    tela: { flex: 1, backgroundColor: cores.chao },
    conteudo: { flexGrow: 1, paddingBottom: espaco.xxxl },
    miolo: { gap: espaco.xxl, paddingHorizontal: espaco.l, paddingTop: espaco.s },
    mioloSemTopo: { paddingTop: espaco.l },
    titulo: { gap: espaco.s },
});
