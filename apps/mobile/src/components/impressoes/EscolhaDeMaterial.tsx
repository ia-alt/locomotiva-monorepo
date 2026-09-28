import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { ALVO_DE_TOQUE, Aviso, Icone, Texto, cores, espaco, raio } from '../../ui';

type Material = { id: string; name: string };

type Props<T extends Material> = {
    materiais: readonly T[];
    carregando: boolean;
    /** Id do material escolhido. */
    escolhido: string | null;
    aoEscolher: (material: T) => void;
};

/** Materiais do catálogo como opções: a escolhida fica azul e ganha um check (a cor não basta sozinha). */
export function EscolhaDeMaterial<T extends Material>({ materiais, carregando, escolhido, aoEscolher }: Props<T>) {
    return (
        <View style={estilos.secao}>
            <Texto variante="apoioForte">Material</Texto>
            {carregando ? (
                <ActivityIndicator color={cores.azul} style={estilos.carregando} />
            ) : materiais.length === 0 ? (
                <Aviso tom="atencao">
                    Nenhum material disponível no momento. Fale com a equipe do Locomotiva Hub.
                </Aviso>
            ) : (
                <View style={estilos.opcoes} accessibilityRole="radiogroup" accessibilityLabel="Material">
                    {materiais.map((material) => {
                        const ativo = material.id === escolhido;
                        return (
                            <Pressable
                                key={material.id}
                                onPress={() => aoEscolher(material)}
                                accessibilityRole="radio"
                                accessibilityState={{ checked: ativo }}
                                accessibilityLabel={material.name}
                                style={({ pressed }) => [
                                    estilos.opcao,
                                    pressed && estilos.opcaoPressionada,
                                    ativo && estilos.opcaoAtiva,
                                ]}
                            >
                                {ativo ? <Icone nome="check" cor={cores.azulTexto} tamanho={18} /> : null}
                                <Texto variante="destaque" cor={ativo ? cores.azulTexto : cores.grafite}>
                                    {material.name.toUpperCase()}
                                </Texto>
                            </Pressable>
                        );
                    })}
                </View>
            )}
        </View>
    );
}

const estilos = StyleSheet.create({
    secao: { gap: espaco.s },
    carregando: { alignSelf: 'flex-start', marginTop: espaco.xs },
    opcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.m },
    opcao: {
        minWidth: '30%',
        flexGrow: 1,
        minHeight: ALVO_DE_TOQUE,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: espaco.s,
        paddingVertical: espaco.l,
        paddingHorizontal: espaco.m,
        borderRadius: raio.controle,
        borderWidth: 1.5,
        borderColor: cores.linha,
        backgroundColor: cores.papel,
    },
    opcaoPressionada: { backgroundColor: cores.pressionadoSobrePapel },
    opcaoAtiva: { borderColor: cores.azul, backgroundColor: cores.azulSuave },
});
