import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Texto } from './Texto';
import { cores, raio, sombra } from './tema';

const LARGURA_DO_CANHOTO = 76;
const LARGURA_DA_PERFURACAO = 2;
const RAIO_DO_ENTALHE = 9;
const FUROS_DA_PERFURACAO = 9;

type Props = {
    /** Conteúdo do canhoto (à esquerda). Para datas, use `CanhotoDeData`. */
    canhoto: React.ReactNode;
    corDoCanhoto?: string;
    children: React.ReactNode;
    onPress?: () => void;
    accessibilityLabel?: string;
    /** Cor de fundo da tela: é ela que aparece nos entalhes do picote. */
    corDoFundo?: string;
};

/**
 * Bilhete com canhoto, picote e entalhes. É a peça de cada reserva: canhoto
 * com a data, corpo com o resto. Os entalhes são círculos da cor do fundo
 * sobre a borda, então o bilhete precisa estar sobre uma cor lisa.
 */
export function Bilhete({
    canhoto,
    corDoCanhoto = cores.azul,
    children,
    onPress,
    accessibilityLabel,
    corDoFundo = cores.chao,
}: Props) {
    const conteudo = (
        <>
            <View style={estilos.recorte}>
                <View style={[estilos.canhoto, { backgroundColor: corDoCanhoto }]}>{canhoto}</View>
                <View style={estilos.perfuracao}>
                    {Array.from({ length: FUROS_DA_PERFURACAO }, (_, i) => (
                        <View key={i} style={estilos.furo} />
                    ))}
                </View>
                <View style={estilos.corpo}>{children}</View>
            </View>
            <View style={[estilos.entalhe, estilos.entalheDeCima, { backgroundColor: corDoFundo }]} />
            <View style={[estilos.entalhe, estilos.entalheDeBaixo, { backgroundColor: corDoFundo }]} />
        </>
    );

    // Sem `onPress` (prévia antes de enviar, topo do detalhe) o bilhete é só
    // informação: não deve ser anunciado como botão.
    if (!onPress) {
        return (
            <View style={estilos.bilhete} accessible accessibilityLabel={accessibilityLabel}>
                {conteudo}
            </View>
        );
    }

    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
            style={({ pressed }) => [estilos.bilhete, pressed && estilos.pressionado]}
        >
            {conteudo}
        </Pressable>
    );
}

/** Canhoto padrão: dia da semana, dia e mês ("SEG / 28 / SET"). */
export function CanhotoDeData({ diaDaSemana, dia, mes }: { diaDaSemana: string; dia: string; mes: string }) {
    return (
        <>
            <Texto variante="rotulo" cor={cores.papel} style={estilos.canhotoLegenda}>{diaDaSemana}</Texto>
            <Texto variante="titulo" cor={cores.papel} style={estilos.canhotoDia}>{dia}</Texto>
            <Texto variante="rotulo" cor={cores.papel} style={estilos.canhotoLegenda}>{mes}</Texto>
        </>
    );
}

const estilos = StyleSheet.create({
    bilhete: {
        height: 112,
        borderRadius: raio.bilhete,
        backgroundColor: cores.papel,
        boxShadow: sombra.bilhete,
    },
    pressionado: { transform: [{ scale: 0.98 }] },
    recorte: {
        flex: 1,
        flexDirection: 'row',
        borderRadius: raio.bilhete,
        overflow: 'hidden',
    },
    canhoto: {
        width: LARGURA_DO_CANHOTO,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
    },
    canhotoLegenda: { fontSize: 13, lineHeight: 16, letterSpacing: 1 },
    canhotoDia: { fontSize: 30, lineHeight: 34 },
    perfuracao: {
        width: LARGURA_DA_PERFURACAO,
        paddingVertical: 14,
        justifyContent: 'space-between',
    },
    furo: {
        width: LARGURA_DA_PERFURACAO,
        height: 5,
        borderRadius: 1,
        backgroundColor: cores.perfuracao,
    },
    corpo: {
        flex: 1,
        minWidth: 0,
        justifyContent: 'space-between',
        paddingTop: 13,
        paddingBottom: 12,
        paddingHorizontal: 14,
    },
    entalhe: {
        position: 'absolute',
        left: LARGURA_DO_CANHOTO + LARGURA_DA_PERFURACAO / 2 - RAIO_DO_ENTALHE,
        width: RAIO_DO_ENTALHE * 2,
        height: RAIO_DO_ENTALHE * 2,
        borderRadius: RAIO_DO_ENTALHE,
    },
    entalheDeCima: { top: -RAIO_DO_ENTALHE },
    entalheDeBaixo: { bottom: -RAIO_DO_ENTALHE },
});
