import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FlipInXDown } from 'react-native-reanimated';
import { cores, fontes, raio } from './tema';

type Props = {
    texto: string;
    /** Largura de cada placa (flap). Altura e letra seguem a mesma proporção. */
    larguraDaPlaca: number;
    corDaLetra?: string;
    /** Atraso da primeira placa, em ms, para encadear com outros letreiros. */
    atraso?: number;
    /** Distância entre placas. */
    vao?: number;
};

const PROPORCAO_ALTURA = 1.38;
const PROPORCAO_LETRA = 0.9;
const PROPORCAO_SEPARADOR = 0.43;
const INTERVALO_ENTRE_PLACAS = 55;

/**
 * Letreiro de painel de estação (split-flap): cada caractere é uma placa
 * que vira ao aparecer. A chave de cada placa inclui o caractere, então quando
 * só um dígito muda (o segundo do cronômetro, por exemplo) só aquela placa vira.
 * O Reanimated desliga a animação quando o sistema pede movimento reduzido.
 */
export function Letreiro({ texto, larguraDaPlaca, corDaLetra = cores.amarelo, atraso = 0, vao = 4 }: Props) {
    const altura = Math.round(larguraDaPlaca * PROPORCAO_ALTURA);
    const tamanhoDaLetra = Math.round(larguraDaPlaca * PROPORCAO_LETRA);

    return (
        <View style={estilos.linha} accessible accessibilityRole="text" accessibilityLabel={texto}>
            {Array.from(texto).map((caractere, indice) => {
                const separador = caractere === ':';
                return (
                    <Animated.View
                        key={`${indice}-${caractere}`}
                        entering={FlipInXDown.delay(atraso + indice * INTERVALO_ENTRE_PLACAS).duration(420)}
                        style={[
                            separador
                                ? { width: Math.round(larguraDaPlaca * PROPORCAO_SEPARADOR) }
                                : [estilos.placa, { width: larguraDaPlaca }],
                            { height: altura, marginRight: vao },
                        ]}
                    >
                        {separador ? null : <View style={estilos.metadeDeCima} />}
                        <Text
                            allowFontScaling={false}
                            style={[estilos.letra, { fontSize: tamanhoDaLetra, lineHeight: altura, color: corDaLetra }]}
                        >
                            {caractere === ' ' ? '' : caractere}
                        </Text>
                        {separador ? null : <View style={estilos.fenda} />}
                    </Animated.View>
                );
            })}
        </View>
    );
}

/**
 * Divide um texto em linhas que cabem em `capacidade` placas, sem cortar
 * palavras (só corta uma palavra maior que a linha inteira).
 */
export function quebrarEmLinhas(texto: string, capacidade: number): string[] {
    const linhas: string[] = [];
    let atual = '';
    for (const palavra of texto.trim().split(/\s+/)) {
        const candidata = atual ? `${atual} ${palavra}` : palavra;
        if (candidata.length <= capacidade) {
            atual = candidata;
            continue;
        }
        if (atual) linhas.push(atual);
        let resto = palavra;
        while (resto.length > capacidade) {
            linhas.push(resto.slice(0, capacidade));
            resto = resto.slice(capacidade);
        }
        atual = resto;
    }
    if (atual) linhas.push(atual);
    return linhas;
}

/** Quantas placas de `larguraDaPlaca` cabem numa largura disponível. */
export function capacidadeDoLetreiro(larguraDisponivel: number, larguraDaPlaca: number, vao = 4): number {
    return Math.max(1, Math.floor((larguraDisponivel + vao) / (larguraDaPlaca + vao)));
}

const estilos = StyleSheet.create({
    linha: { flexDirection: 'row', alignItems: 'center' },
    placa: {
        borderRadius: raio.flap,
        backgroundColor: cores.painel.flapBase,
        overflow: 'hidden',
        boxShadow: 'inset 0px 1px 0px rgba(255, 255, 255, 0.07)',
    },
    metadeDeCima: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: '50%',
        backgroundColor: cores.painel.flapTopo,
    },
    letra: {
        fontFamily: fontes.flap,
        textAlign: 'center',
        textAlignVertical: 'center',
        includeFontPadding: false,
    },
    fenda: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: '50%',
        height: 1,
        marginTop: -0.5,
        backgroundColor: cores.painel.fenda,
    },
});
