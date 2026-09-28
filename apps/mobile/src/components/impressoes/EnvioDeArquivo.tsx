import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { PickedPrintFile } from '../../utils/pick-print-file';
import { ALVO_DE_TOQUE, Icone, Texto, cores, espaco, raio } from '../../ui';

type Props = {
    /** Rótulo acima da caixa, como o do `Campo` ("Modelo 3D (.stl)"). */
    rotulo: string;
    /** Texto da caixa enquanto não há arquivo ("Anexar arquivo .stl"). */
    chamada: string;
    arquivo: PickedPrintFile | null;
    aoEscolher: () => void;
};

/**
 * Espaço para anexar um arquivo do pedido: caixa tracejada enquanto está
 * vazio; depois, uma linha com o nome do arquivo e a opção de trocar.
 */
export function EnvioDeArquivo({ rotulo, chamada, arquivo, aoEscolher }: Props) {
    return (
        <View style={estilos.secao}>
            <Texto variante="apoioForte">{rotulo}</Texto>
            {arquivo ? (
                <View style={estilos.escolhido}>
                    <Icone nome="arquivo" cor={cores.sucessoTexto} tamanho={20} />
                    <Texto variante="destaqueMedio" numberOfLines={1} style={estilos.nome}>
                        {arquivo.fileName}
                    </Texto>
                    <Pressable
                        onPress={aoEscolher}
                        accessibilityRole="button"
                        accessibilityLabel={`Trocar ${rotulo}`}
                        style={({ pressed }) => [estilos.trocar, pressed && estilos.trocarPressionado]}
                    >
                        <Texto variante="apoioForte" cor={cores.azulTexto}>Trocar</Texto>
                    </Pressable>
                </View>
            ) : (
                <Pressable
                    onPress={aoEscolher}
                    accessibilityRole="button"
                    accessibilityLabel={chamada}
                    style={({ pressed }) => [estilos.caixa, pressed && estilos.caixaPressionada]}
                >
                    <Icone nome="enviarArquivo" cor={cores.azul} tamanho={32} />
                    <Texto variante="destaque" cor={cores.azulTexto}>{chamada}</Texto>
                </Pressable>
            )}
        </View>
    );
}

const estilos = StyleSheet.create({
    secao: { gap: espaco.s },
    caixa: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: espaco.s,
        paddingVertical: espaco.xxl,
        paddingHorizontal: espaco.l,
        borderRadius: raio.controle,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: cores.azul,
        backgroundColor: cores.papel,
    },
    caixaPressionada: { backgroundColor: cores.azulSuave },
    // Mesma caixa do `Campo` preenchido: o arquivo escolhido vira um valor do formulário.
    escolhido: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: espaco.m,
        paddingVertical: espaco.xs,
        paddingLeft: espaco.l,
        paddingRight: espaco.xs,
        borderRadius: raio.controle,
        borderWidth: 1.5,
        borderColor: cores.linha,
        backgroundColor: cores.papel,
    },
    nome: { flex: 1 },
    trocar: {
        minHeight: ALVO_DE_TOQUE,
        justifyContent: 'center',
        paddingHorizontal: espaco.m,
        borderRadius: raio.controle,
    },
    trocarPressionado: { backgroundColor: cores.pressionadoSobrePapel },
});
