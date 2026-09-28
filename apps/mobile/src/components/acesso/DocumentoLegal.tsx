import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { BarraDeVoltar, Cartao, Texto, cores, espaco, fontes } from '../../ui';

type Props = {
    titulo: string;
    /** Data da versão em vigor, por extenso ("23 de abril de 2026"). */
    atualizadoEm: string;
    onVoltar: () => void;
    children: React.ReactNode;
};

/**
 * Termos de Serviço e Política de Privacidade. A seta de voltar fica fixa em
 * cima, porque o texto é longo; o texto legal em si vem das telas.
 */
export function DocumentoLegal({ titulo, atualizadoEm, onVoltar, children }: Props) {
    return (
        <View style={estilos.tela}>
            <BarraDeVoltar onVoltar={onVoltar} />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={estilos.conteudo}>
                <View style={estilos.abertura}>
                    <Texto variante="titulo" accessibilityRole="header">
                        {titulo}
                    </Texto>
                    <Texto variante="apoio" cor={cores.textoSecundario}>
                        Última atualização: {atualizadoEm}
                    </Texto>
                </View>

                {children}

                <Cartao>
                    <Texto variante="apoio" cor={cores.textoSecundario} style={estilos.centralizado}>
                        SECTI – Secretaria de Estado da Ciência, Tecnologia e Inovação{'\n'}
                        CNPJ: 05.572.043/0001-65{'\n'}
                        Av. dos Holandeses, 9 – Calhau, São Luís – MA, CEP 65.071-380
                    </Texto>
                </Cartao>
            </ScrollView>
        </View>
    );
}

export function SecaoDoDocumento({ titulo, children }: { titulo: string; children: React.ReactNode }) {
    return (
        <View style={estilos.secao}>
            <Texto variante="secao" accessibilityRole="header">
                {titulo}
            </Texto>
            {children}
        </View>
    );
}

export function Paragrafo({ children }: { children: React.ReactNode }) {
    return <Texto variante="corpo">{children}</Texto>;
}

/** Trecho em negrito dentro de um `Paragrafo`. */
export function Negrito({ children }: { children: React.ReactNode }) {
    return (
        <Texto variante="corpo" style={estilos.negrito}>
            {children}
        </Texto>
    );
}

const estilos = StyleSheet.create({
    tela: { flex: 1, backgroundColor: cores.chao },
    conteudo: {
        gap: espaco.xl,
        paddingHorizontal: espaco.l,
        paddingTop: espaco.s,
        paddingBottom: espaco.xxxl,
    },
    abertura: { gap: espaco.s },
    secao: { gap: espaco.m },
    negrito: { fontFamily: fontes.negrito },
    centralizado: { textAlign: 'center' },
});
