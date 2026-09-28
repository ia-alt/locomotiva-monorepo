import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Icone, NomeDoIcone } from './Icone';
import { Texto } from './Texto';
import { cores, raio } from './tema';

type Props = {
    titulo: string;
    onPress?: () => void;
    /**
     * `primario`: azul cheio, para a ação principal da tela. `contorno`: ações
     * secundárias. `perigo`: ações destrutivas (sair, cancelar uma reserva).
     */
    variante?: 'primario' | 'contorno' | 'perigo';
    /** `alto` (56) para a ação principal de uma seção; `compacto` (44) para cabeçalhos. */
    tamanho?: 'normal' | 'alto' | 'compacto';
    icone?: NomeDoIcone;
    /** Ícone depois do texto (setas de "Avançar"). */
    iconeNoFim?: boolean;
    carregando?: boolean;
    desabilitado?: boolean;
    /** Quando o texto visível é curto demais para quem usa leitor de tela ("Nova"). */
    accessibilityLabel?: string;
    accessibilityHint?: string;
};

const CORES_DO_CONTEUDO = {
    primario: cores.papel,
    contorno: cores.grafite,
    perigo: cores.erro,
} as const;

export function Botao({
    titulo,
    onPress,
    variante = 'primario',
    tamanho = 'normal',
    icone,
    iconeNoFim = false,
    carregando = false,
    desabilitado = false,
    accessibilityLabel,
    accessibilityHint,
}: Props) {
    const inativo = desabilitado || carregando;
    const corDoConteudo = CORES_DO_CONTEUDO[variante];
    const desenhoDoIcone = icone ? (
        <Icone nome={icone} cor={corDoConteudo} tamanho={tamanho === 'compacto' ? 20 : 22} />
    ) : null;

    return (
        <Pressable
            onPress={onPress}
            disabled={inativo}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel ?? titulo}
            accessibilityHint={accessibilityHint}
            accessibilityState={{ disabled: inativo, busy: carregando }}
            style={({ pressed }) => [
                estilos.base,
                estilos[tamanho],
                estilos[variante],
                pressed && estilos.pressionado,
                pressed && variante === 'primario' && estilos.primarioPressionado,
                pressed && variante === 'contorno' && estilos.contornoPressionado,
                pressed && variante === 'perigo' && estilos.perigoPressionado,
                inativo && !carregando && estilos.inativo,
            ]}
        >
            {carregando ? (
                <ActivityIndicator color={corDoConteudo} />
            ) : (
                <View style={estilos.conteudo}>
                    {iconeNoFim ? null : desenhoDoIcone}
                    <Texto variante="botao" cor={corDoConteudo} style={tamanho === 'alto' && estilos.textoAlto}>
                        {titulo}
                    </Texto>
                    {iconeNoFim ? desenhoDoIcone : null}
                </View>
            )}
        </Pressable>
    );
}

const estilos = StyleSheet.create({
    base: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: raio.botao,
    },
    normal: { height: 48, paddingHorizontal: 20 },
    alto: { height: 56, paddingHorizontal: 20 },
    compacto: { height: 44, paddingLeft: 12, paddingRight: 16 },
    primario: { backgroundColor: cores.azul },
    contorno: { backgroundColor: cores.papel, borderWidth: 1.5, borderColor: cores.grafite },
    perigo: { backgroundColor: cores.papel, borderWidth: 1.5, borderColor: cores.erro },
    pressionado: { transform: [{ scale: 0.97 }] },
    primarioPressionado: { backgroundColor: cores.azulPressionado },
    contornoPressionado: { backgroundColor: cores.pressionadoSobrePapel },
    perigoPressionado: { backgroundColor: cores.erroSuave },
    inativo: { opacity: 0.5 },
    conteudo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    textoAlto: { fontSize: 17 },
});
