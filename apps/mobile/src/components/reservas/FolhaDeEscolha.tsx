import React from 'react';
import { Modal, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Botao, Texto, cores, espaco, raio } from '../../ui';

/** Mesmo limite do App.tsx: no navegador largo a folha não passa da coluna do app. */
const LARGURA_MAXIMA = 800;
const ALCA = { largura: 40, altura: 4 };

type Props = {
    visivel: boolean;
    titulo: string;
    aoFechar: () => void;
    aoConfirmar: () => void;
    confirmarDesabilitado?: boolean;
    /** Altura fixa, para listas que rolam dentro da folha. Sem ela, a folha segue o conteúdo. */
    altura?: number;
    children: React.ReactNode;
};

/**
 * Folha que sobe do pé da tela para escolher uma data ou um horário, com
 * Cancelar e Confirmar embaixo. Tocar fora da folha também fecha sem escolher.
 */
export function FolhaDeEscolha({
    visivel,
    titulo,
    aoFechar,
    aoConfirmar,
    confirmarDesabilitado = false,
    altura,
    children,
}: Props) {
    const { width } = useWindowDimensions();
    // O modal cobre a tela toda, inclusive a faixa de gestos embaixo.
    const { bottom } = useSafeAreaInsets();

    return (
        <Modal visible={visivel} transparent animationType="slide" onRequestClose={aoFechar}>
            <View style={estilos.veu}>
                <Pressable style={estilos.foraDaFolha} onPress={aoFechar} accessibilityRole="button" accessibilityLabel="Fechar" />
                <View
                    style={[
                        estilos.folha,
                        { width: Math.min(width, LARGURA_MAXIMA), height: altura, paddingBottom: bottom + espaco.l },
                    ]}
                >
                    <View style={estilos.alca} />
                    <Texto variante="secao" accessibilityRole="header">{titulo}</Texto>
                    {children}
                    <View style={estilos.rodape}>
                        <View style={estilos.botao}>
                            <Botao titulo="Cancelar" variante="contorno" onPress={aoFechar} />
                        </View>
                        <View style={estilos.botao}>
                            <Botao titulo="Confirmar" desabilitado={confirmarDesabilitado} onPress={aoConfirmar} />
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const estilos = StyleSheet.create({
    veu: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: cores.veu,
    },
    foraDaFolha: { flex: 1 },
    folha: {
        alignSelf: 'center',
        gap: espaco.l,
        paddingHorizontal: espaco.xl,
        paddingTop: espaco.m,
        borderTopLeftRadius: raio.cartao,
        borderTopRightRadius: raio.cartao,
        backgroundColor: cores.papel,
    },
    alca: {
        alignSelf: 'center',
        width: ALCA.largura,
        height: ALCA.altura,
        borderRadius: ALCA.altura / 2,
        backgroundColor: cores.linha,
    },
    rodape: { flexDirection: 'row', gap: espaco.m },
    botao: { flex: 1 },
});
