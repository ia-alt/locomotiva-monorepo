import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Texto, cores, espaco, fontes } from '../../ui';

type Props = {
    titulo: string;
    onPress: () => void;
    id?: string;
};

/** Texto azul que leva a outra tela ("Esqueci minha senha", "Criar conta"). */
export function LinkDeTexto({ titulo, onPress, id }: Props) {
    return (
        <Pressable
            id={id}
            onPress={onPress}
            accessibilityRole="link"
            // O texto tem 21 px de altura: a folga completa os 44 px de toque.
            hitSlop={12}
            style={({ pressed }) => pressed && estilos.pressionado}
        >
            <Texto variante="explicacao" cor={cores.azulTexto} style={estilos.link}>
                {titulo}
            </Texto>
        </Pressable>
    );
}

/** Pergunta com o link ao lado, no pé da tela ("Ainda não tem conta? Criar conta"). */
export function RodapeComLink({ pergunta, link, onPress, id }: {
    pergunta: string;
    link: string;
    onPress: () => void;
    id?: string;
}) {
    return (
        <View style={estilos.rodape}>
            <Texto variante="explicacao" cor={cores.textoSecundario}>
                {pergunta}
            </Texto>
            <LinkDeTexto titulo={link} onPress={onPress} id={id} />
        </View>
    );
}

const estilos = StyleSheet.create({
    link: { fontFamily: fontes.negrito },
    pressionado: { opacity: 0.6 },
    rodape: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        gap: espaco.xs,
    },
});
