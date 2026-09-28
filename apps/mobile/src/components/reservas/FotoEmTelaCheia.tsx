import React from 'react';
import { Image, ImageSourcePropType, Modal, Pressable, StatusBar, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ALVO_DE_TOQUE, Icone, cores, espaco } from '../../ui';

type Props = {
    /** Foto aberta. `null` fecha. */
    foto: ImageSourcePropType | null;
    aoFechar: () => void;
    /** O que a foto mostra, para leitores de tela. */
    descricao?: string;
};

/** Foto da sala em tela cheia, sobre fundo escuro, para ver o espaço em detalhe. */
export function FotoEmTelaCheia({ foto, aoFechar, descricao }: Props) {
    // O modal cobre a tela toda, por baixo da barra de status: o botão de
    // fechar desce o tanto do recorte da câmera.
    const { top } = useSafeAreaInsets();

    return (
        <Modal visible={foto !== null} transparent animationType="fade" statusBarTranslucent onRequestClose={aoFechar}>
            <View style={estilos.fundo}>
                <StatusBar hidden />
                {foto !== null ? (
                    <Image source={foto} style={estilos.foto} resizeMode="contain" accessibilityLabel={descricao} />
                ) : null}
                <Pressable
                    onPress={aoFechar}
                    accessibilityRole="button"
                    accessibilityLabel="Fechar foto"
                    style={({ pressed }) => [estilos.fechar, { top: top + espaco.m }, pressed && estilos.pressionado]}
                >
                    <Icone nome="fechar" cor={cores.painel.letraClara} />
                </Pressable>
            </View>
        </Modal>
    );
}

const estilos = StyleSheet.create({
    fundo: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: cores.grafite,
    },
    foto: { width: '100%', height: '80%' },
    fechar: {
        position: 'absolute',
        right: espaco.l,
        width: ALVO_DE_TOQUE,
        height: ALVO_DE_TOQUE,
        borderRadius: ALVO_DE_TOQUE / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: cores.painel.flapTopo,
    },
    pressionado: { transform: [{ scale: 0.94 }] },
});
