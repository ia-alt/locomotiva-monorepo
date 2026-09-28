import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Icone, NomeDoIcone } from './Icone';
import { Texto } from './Texto';
import { cores } from './tema';

type Tom = 'info' | 'atencao' | 'erro' | 'sucesso';

const TONS: Record<Tom, { fundo: string; texto: string; icone: NomeDoIcone }> = {
    info: { fundo: cores.azulSuave, texto: cores.azulTexto, icone: 'info' },
    atencao: { fundo: cores.atencaoSuave, texto: cores.atencaoTexto, icone: 'alerta' },
    erro: { fundo: cores.erroSuave, texto: cores.erro, icone: 'alerta' },
    sucesso: { fundo: cores.sucessoSuave, texto: cores.sucessoTexto, icone: 'sucesso' },
};

/** Recado curto dentro da tela (orientação, motivo de recusa, confirmação). */
export function Aviso({
    tom = 'info',
    titulo,
    children,
    style,
}: {
    tom?: Tom;
    titulo?: string;
    children?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}) {
    const { fundo, texto, icone } = TONS[tom];
    return (
        <View style={[estilos.aviso, { backgroundColor: fundo }, style]} accessibilityRole={tom === 'erro' ? 'alert' : undefined}>
            <Icone nome={icone} cor={texto} tamanho={20} />
            <View style={estilos.textos}>
                {titulo ? <Texto variante="destaque" cor={texto}>{titulo}</Texto> : null}
                {typeof children === 'string' ? (
                    <Texto variante="explicacao" cor={texto}>{children}</Texto>
                ) : (
                    children
                )}
            </View>
        </View>
    );
}

const estilos = StyleSheet.create({
    aviso: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        padding: 14,
        borderRadius: 14,
    },
    textos: { flex: 1, gap: 2 },
});
