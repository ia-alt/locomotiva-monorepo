import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { Botao } from './Botao';
import { Icone } from './Icone';
import { Texto } from './Texto';
import { cores, espaco } from './tema';

type Props = {
    titulo: string;
    texto: string;
    rotuloDoBotao: string;
    aoContinuar: () => void;
    /** Conteúdo extra entre o texto e o botão (um aviso, um resumo). */
    children?: React.ReactNode;
};

/**
 * Tela de fim de fluxo (reserva enviada, pedido enviado): selo de via livre,
 * título, explicação do que acontece agora e um botão para seguir.
 */
export function TelaDeConclusao({ titulo, texto, rotuloDoBotao, aoContinuar, children }: Props) {
    return (
        <View style={estilos.tela}>
            <View style={estilos.centro}>
                <Animated.View entering={ZoomIn.duration(420)} style={estilos.selo}>
                    <Icone nome="check" cor={cores.amarelo} tamanho={52} />
                </Animated.View>
                <Texto variante="chamada" accessibilityRole="header" style={estilos.centralizado}>
                    {titulo}
                </Texto>
                <Texto variante="corpo" cor={cores.textoSecundario} style={estilos.centralizado}>
                    {texto}
                </Texto>
                {children}
            </View>
            <Botao titulo={rotuloDoBotao} tamanho="alto" onPress={aoContinuar} />
        </View>
    );
}

const estilos = StyleSheet.create({
    tela: {
        flex: 1,
        justifyContent: 'space-between',
        padding: espaco.xxl,
        backgroundColor: cores.chao,
    },
    centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: espaco.l },
    selo: {
        width: 112,
        height: 112,
        borderRadius: 56,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: espaco.s,
        backgroundColor: cores.grafite,
        borderWidth: 6,
        borderColor: cores.amarelo,
    },
    centralizado: { textAlign: 'center' },
});
