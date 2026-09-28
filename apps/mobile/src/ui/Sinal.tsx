import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Texto, VarianteDeTexto } from './Texto';
import { cores } from './tema';

export type AspectoDoSinal = 'verde' | 'amarelo' | 'vermelho' | 'apagado';

/** De cima para baixo, como no sinal ferroviário de três aspectos. */
const LAMPADAS = ['vermelho', 'amarelo', 'verde'] as const;

type PropsDoSinal = {
    aspecto: AspectoDoSinal;
    /** Sobre o painel escuro a caixa e as lâmpadas apagadas ficam mais escuras. */
    noPainel?: boolean;
};

/**
 * Sinal de trem que indica a situação de algo (reserva, hub aberto...).
 * A posição da lâmpada acesa também carrega o significado, então quem não
 * distingue cores ainda lê o estado. Sempre acompanhe de texto
 * (`SinalComRotulo`): o sinal sozinho é decorativo para leitores de tela.
 */
export function Sinal({ aspecto, noPainel = false }: PropsDoSinal) {
    return (
        <View
            accessible={false}
            importantForAccessibility="no-hide-descendants"
            accessibilityElementsHidden
            style={[estilos.caixa, { backgroundColor: noPainel ? cores.sinal.caixaNoPainel : cores.sinal.caixa }]}
        >
            {LAMPADAS.map((lampada) => {
                const acesa = aspecto === lampada;
                const apagada = noPainel ? cores.sinal.apagadoNoPainel : cores.sinal.apagado;
                return (
                    <View
                        key={lampada}
                        style={[
                            estilos.lampada,
                            { backgroundColor: acesa ? cores.sinal[lampada] : apagada },
                            acesa && { boxShadow: `0px 0px 5px ${cores.sinal[lampada]}` },
                        ]}
                    />
                );
            })}
        </View>
    );
}

type PropsComRotulo = PropsDoSinal & {
    rotulo: string;
    variante?: VarianteDeTexto;
    cor?: string;
};

export function SinalComRotulo({ aspecto, noPainel = false, rotulo, variante = 'apoioForte', cor }: PropsComRotulo) {
    return (
        <View style={estilos.comRotulo} accessible accessibilityLabel={rotulo}>
            <Sinal aspecto={aspecto} noPainel={noPainel} />
            <Texto variante={variante} cor={cor ?? (noPainel ? cores.painel.texto : cores.grafite)} numberOfLines={1}>
                {rotulo}
            </Texto>
        </View>
    );
}

const estilos = StyleSheet.create({
    caixa: {
        width: 12,
        height: 30,
        paddingVertical: 4,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    lampada: { width: 6, height: 6, borderRadius: 3 },
    comRotulo: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
});
