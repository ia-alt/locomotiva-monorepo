import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Icone, NomeDoIcone } from './Icone';
import { Texto } from './Texto';
import { cores, raio } from './tema';

/** Superfície branca para agrupar informações (detalhes, confirmação, perfil). */
export function Cartao({
    titulo,
    children,
    style,
}: {
    titulo?: string;
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}) {
    return (
        <View style={[estilos.cartao, style]}>
            {titulo ? (
                <Texto variante="apoioForte" cor={cores.textoSecundario} accessibilityRole="header">
                    {titulo}
                </Texto>
            ) : null}
            {children}
        </View>
    );
}

/** Uma informação dentro do cartão: ícone opcional, rótulo pequeno e o valor. */
export function LinhaDeInformacao({
    icone,
    rotulo,
    valor,
}: {
    icone?: NomeDoIcone;
    rotulo: string;
    valor: React.ReactNode;
}) {
    return (
        <View style={estilos.linha} accessible accessibilityLabel={typeof valor === 'string' ? `${rotulo}: ${valor}` : undefined}>
            {icone ? (
                <View style={estilos.icone}>
                    <Icone nome={icone} cor={cores.textoSecundario} tamanho={18} />
                </View>
            ) : null}
            <View style={estilos.textos}>
                <Texto variante="apoio" cor={cores.textoSecundario}>{rotulo}</Texto>
                {typeof valor === 'string' ? <Texto variante="destaqueMedio">{valor}</Texto> : valor}
            </View>
        </View>
    );
}

const estilos = StyleSheet.create({
    cartao: {
        gap: 14,
        padding: 16,
        borderRadius: raio.cartao,
        backgroundColor: cores.papel,
    },
    linha: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    icone: { width: 20, paddingTop: 2, alignItems: 'center' },
    textos: { flex: 1, gap: 2 },
});
