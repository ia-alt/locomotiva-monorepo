import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icone } from './Icone';
import { Texto } from './Texto';
import { ALVO_DE_TOQUE, cores } from './tema';

type Props = {
    onVoltar: () => void;
    titulo?: string;
    direita?: React.ReactNode;
};

/**
 * Barra com o botão de voltar para telas sem o cabeçalho do navegador (as
 * telas de acesso: login, cadastro, senha). As telas logadas usam o cabeçalho
 * da pilha, já estilizado em PrivateNavigator.
 */
export function BarraDeVoltar({ onVoltar, titulo, direita }: Props) {
    return (
        <View style={estilos.barra}>
            <Pressable
                onPress={onVoltar}
                accessibilityRole="button"
                accessibilityLabel="Voltar"
                hitSlop={4}
                style={({ pressed }) => [estilos.botao, pressed && estilos.pressionado]}
            >
                <Icone nome="voltar" />
            </Pressable>
            <View style={estilos.meio}>
                {titulo ? (
                    <Texto variante="secao" numberOfLines={1} accessibilityRole="header">
                        {titulo}
                    </Texto>
                ) : null}
            </View>
            {direita}
        </View>
    );
}

const estilos = StyleSheet.create({
    barra: {
        height: 52,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 6,
    },
    botao: {
        width: ALVO_DE_TOQUE,
        height: ALVO_DE_TOQUE,
        borderRadius: ALVO_DE_TOQUE / 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pressionado: { backgroundColor: cores.pressionadoSobrePapel },
    meio: { flex: 1 },
});
