import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icone } from './Icone';
import { Texto } from './Texto';
import { cores } from './tema';

type Props = {
    /** Nome de cada etapa, na ordem ("Sala", "Horário", "Detalhes"). */
    paradas: readonly string[];
    /** Etapa atual, começando em 0. */
    atual: number;
};

const ESTACAO = 22;
const TRILHO = 3;

/**
 * Indicador de etapas como uma linha de trem: estações já percorridas ficam
 * cheias com um check, a atual ganha o amarelo da plataforma ("você está
 * aqui") e as próximas ficam vazadas. Use nos fluxos de várias telas.
 */
export function Trajeto({ paradas, atual }: Props) {
    const quantidade = paradas.length;
    const margem = 50 / quantidade;
    const vao = 100 - 2 * margem;
    const percorrido = quantidade > 1 ? (vao * atual) / (quantidade - 1) : 0;

    return (
        <View
            style={estilos.trajeto}
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel={`Etapa ${atual + 1} de ${quantidade}: ${paradas[atual]}`}
        >
            <View style={[estilos.trilho, { left: `${margem}%`, right: `${margem}%` }]} />
            <View style={[estilos.trilho, estilos.trilhoPercorrido, { left: `${margem}%`, width: `${percorrido}%` }]} />
            {paradas.map((nome, indice) => {
                const feita = indice < atual;
                const aqui = indice === atual;
                return (
                    <View key={nome} style={estilos.parada}>
                        <View style={[estilos.estacao, feita && estilos.feita, aqui && estilos.aqui]}>
                            {feita ? <Icone nome="check" cor={cores.papel} tamanho={13} /> : null}
                        </View>
                        <Texto
                            variante="rotulo"
                            cor={feita || aqui ? cores.grafite : cores.textoApagado}
                            numberOfLines={1}
                        >
                            {nome}
                        </Texto>
                    </View>
                );
            })}
        </View>
    );
}

const estilos = StyleSheet.create({
    trajeto: { flexDirection: 'row' },
    trilho: {
        position: 'absolute',
        top: ESTACAO / 2 - TRILHO / 2,
        height: TRILHO,
        borderRadius: TRILHO / 2,
        backgroundColor: cores.linha,
    },
    trilhoPercorrido: { backgroundColor: cores.grafite },
    parada: { flex: 1, alignItems: 'center', gap: 6 },
    estacao: {
        width: ESTACAO,
        height: ESTACAO,
        borderRadius: ESTACAO / 2,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: cores.linha,
        backgroundColor: cores.papel,
    },
    feita: { borderColor: cores.grafite, backgroundColor: cores.grafite },
    aqui: { borderWidth: 4, borderColor: cores.grafite, backgroundColor: cores.amarelo },
});
