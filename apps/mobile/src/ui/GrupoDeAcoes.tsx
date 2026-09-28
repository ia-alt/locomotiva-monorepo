import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icone, NomeDoIcone } from './Icone';
import { Texto } from './Texto';
import { cores, raio } from './tema';

/** Cartão branco com ações em linhas, separadas por um fio. */
export function GrupoDeAcoes({ children }: { children: React.ReactNode }) {
    const itens = React.Children.toArray(children);
    return (
        <View style={estilos.grupo}>
            {itens.map((item, indice) => (
                <React.Fragment key={indice}>
                    {indice > 0 ? <View style={estilos.separador} /> : null}
                    {item}
                </React.Fragment>
            ))}
        </View>
    );
}

type PropsDoItem = {
    icone: NomeDoIcone;
    titulo: string;
    descricao?: string;
    onPress?: () => void;
};

export function ItemDeAcao({ icone, titulo, descricao, onPress }: PropsDoItem) {
    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={descricao ? `${titulo}. ${descricao}` : titulo}
            style={({ pressed }) => [estilos.item, pressed && estilos.itemPressionado]}
        >
            <View style={estilos.caixaDoIcone}>
                <Icone nome={icone} cor={cores.azul} tamanho={22} />
            </View>
            <View style={estilos.textos}>
                <Texto variante="destaque">{titulo}</Texto>
                {descricao ? (
                    <Texto variante="apoio" cor={cores.textoSecundario}>
                        {descricao}
                    </Texto>
                ) : null}
            </View>
            <Icone nome="avancar" cor={cores.seta} tamanho={20} />
        </Pressable>
    );
}

const TAMANHO_DO_ICONE = 40;
const RECUO_DO_ICONE = 16;
const VAO = 14;

const estilos = StyleSheet.create({
    grupo: {
        borderRadius: raio.cartao,
        backgroundColor: cores.papel,
        overflow: 'hidden',
    },
    separador: {
        height: 1,
        marginLeft: RECUO_DO_ICONE + TAMANHO_DO_ICONE + VAO,
        backgroundColor: cores.linhaSobrePapel,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: VAO,
        minHeight: 68,
        paddingVertical: 12,
        paddingLeft: RECUO_DO_ICONE,
        paddingRight: 14,
    },
    itemPressionado: { backgroundColor: cores.pressionadoSobrePapel },
    caixaDoIcone: {
        width: TAMANHO_DO_ICONE,
        height: TAMANHO_DO_ICONE,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: cores.azulSuave,
    },
    textos: { flex: 1, gap: 2 },
});
