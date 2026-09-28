import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Texto } from './Texto';
import { ALVO_DE_TOQUE, cores, sombra } from './tema';

type Opcao<T extends string> = { valor: T; rotulo: string };

type Props<T extends string> = {
    opcoes: readonly Opcao<T>[];
    valor: T;
    aoMudar: (valor: T) => void;
    accessibilityLabel?: string;
};

/** Alternância entre duas ou três visões da mesma lista ("Próximas" / "Anteriores"). */
export function Segmentado<T extends string>({ opcoes, valor, aoMudar, accessibilityLabel }: Props<T>) {
    return (
        <View accessibilityRole="tablist" accessibilityLabel={accessibilityLabel} style={estilos.trilho}>
            {opcoes.map((opcao) => {
                const ativa = opcao.valor === valor;
                return (
                    <Pressable
                        key={opcao.valor}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: ativa }}
                        onPress={() => aoMudar(opcao.valor)}
                        style={[estilos.opcao, ativa && estilos.opcaoAtiva]}
                    >
                        <Texto
                            variante={ativa ? 'destaque' : 'destaqueMedio'}
                            cor={ativa ? cores.grafite : cores.textoDoSegmentado}
                            style={estilos.rotulo}
                        >
                            {opcao.rotulo}
                        </Texto>
                    </Pressable>
                );
            })}
        </View>
    );
}

const estilos = StyleSheet.create({
    trilho: {
        flexDirection: 'row',
        gap: 4,
        height: ALVO_DE_TOQUE,
        padding: 4,
        borderRadius: 13,
        backgroundColor: cores.trilhoDoSegmentado,
    },
    opcao: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 9,
    },
    opcaoAtiva: {
        backgroundColor: cores.papel,
        boxShadow: sombra.segmentoAtivo,
    },
    rotulo: { fontSize: 15 },
});
