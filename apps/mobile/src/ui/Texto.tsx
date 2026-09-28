import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';
import { cores, variantesDeTexto } from './tema';

export type VarianteDeTexto = keyof typeof variantesDeTexto;

type Props = TextProps & {
    variante?: VarianteDeTexto;
    cor?: string;
};

/**
 * Texto com as fontes da identidade. Escolha a `variante` pelo papel do texto
 * (título, apoio, rótulo...), não pelo tamanho; ajustes pontuais vão em `style`.
 */
export function Texto({ variante = 'corpo', cor = cores.grafite, style, ...resto }: Props) {
    return <Text {...resto} style={[estilos.base, variantesDeTexto[variante], { color: cor }, style]} />;
}

const estilos = StyleSheet.create({
    // Sem isso o Android soma um respiro extra acima e abaixo da fonte e o
    // texto fica desalinhado em relação a ícones e caixas.
    base: { includeFontPadding: false },
});
