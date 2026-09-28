import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Icone, NomeDoIcone, Texto, cores, espaco, raio, variantesDeTexto } from '../../ui';

type Props = {
    valor: number;
    maximo: number;
    aoDiminuir: () => void;
    aoAumentar: () => void;
    /** Texto digitado no meio do seletor, como veio do teclado. */
    aoDigitar: (texto: string) => void;
};

const ALTURA = 56;

/**
 * Quantidade de pessoas: botões de menos e mais nas pontas e o número no
 * meio, que também aceita digitação (mais rápido para turmas grandes).
 */
export function SeletorDePessoas({ valor, maximo, aoDiminuir, aoAumentar, aoDigitar }: Props) {
    const [focado, setFocado] = useState(false);

    return (
        <View style={estilos.seletor}>
            <Texto variante="apoioForte">
                Quantidade de pessoas{' '}
                <Texto variante="apoio" cor={cores.textoSecundario}>(máx. {maximo})</Texto>
            </Texto>
            <View style={[estilos.caixa, focado && estilos.caixaFocada]}>
                <BotaoDoSeletor
                    icone="menos"
                    rotulo="Uma pessoa a menos"
                    desabilitado={valor <= 0}
                    onPress={aoDiminuir}
                />
                <TextInput
                    value={valor === 0 ? '' : String(valor)}
                    onChangeText={aoDigitar}
                    keyboardType="numeric"
                    placeholder="Não informado"
                    placeholderTextColor={cores.textoApagado}
                    selectionColor={cores.azul}
                    textAlign="center"
                    accessibilityLabel={`Quantidade de pessoas, no máximo ${maximo}`}
                    onFocus={() => setFocado(true)}
                    onBlur={() => setFocado(false)}
                    style={estilos.numero}
                />
                <BotaoDoSeletor
                    icone="mais"
                    rotulo="Uma pessoa a mais"
                    desabilitado={valor >= maximo}
                    onPress={aoAumentar}
                />
            </View>
            {valor === 0 ? (
                <Texto variante="apoio" cor={cores.textoSecundario}>Informe quantas pessoas participarão.</Texto>
            ) : null}
            {valor >= maximo ? (
                <Texto variante="apoio" cor={cores.atencaoTexto}>
                    Limite máximo da sala atingido ({maximo} pessoas).
                </Texto>
            ) : null}
        </View>
    );
}

type PropsDoBotao = {
    icone: NomeDoIcone;
    rotulo: string;
    desabilitado: boolean;
    onPress: () => void;
};

function BotaoDoSeletor({ icone, rotulo, desabilitado, onPress }: PropsDoBotao) {
    return (
        <Pressable
            onPress={onPress}
            disabled={desabilitado}
            accessibilityRole="button"
            accessibilityLabel={rotulo}
            accessibilityState={{ disabled: desabilitado }}
            style={({ pressed }) => [estilos.botao, pressed && estilos.botaoPressionado]}
        >
            <Icone nome={icone} cor={desabilitado ? cores.perfuracao : cores.azul} />
        </Pressable>
    );
}

const estilos = StyleSheet.create({
    seletor: { gap: espaco.s },
    caixa: {
        height: ALTURA,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: raio.controle,
        borderWidth: 1.5,
        borderColor: cores.linha,
        backgroundColor: cores.papel,
        overflow: 'hidden',
    },
    caixaFocada: { borderColor: cores.azul },
    botao: {
        width: ALTURA,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    botaoPressionado: { backgroundColor: cores.pressionadoSobrePapel },
    numero: {
        flex: 1,
        height: '100%',
        paddingVertical: 0,
        paddingHorizontal: espaco.s,
        fontFamily: variantesDeTexto.secao.fontFamily,
        fontSize: variantesDeTexto.secao.fontSize,
        color: cores.grafite,
        includeFontPadding: false,
        outlineWidth: 0,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: cores.linhaSobrePapel,
    },
});
