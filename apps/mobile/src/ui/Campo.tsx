import React, { forwardRef, useState } from 'react';
import { Pressable, StyleProp, StyleSheet, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { Icone, NomeDoIcone } from './Icone';
import { Texto } from './Texto';
import { cores, fontes, raio } from './tema';

type Props = Omit<TextInputProps, 'style'> & {
    /** Rótulo sempre visível acima do campo (nunca use só o placeholder como rótulo). */
    rotulo: string;
    /** Mensagem de erro: deixa a borda vermelha e aparece abaixo do campo. */
    erro?: string;
    /** Dica abaixo do campo, quando não há erro. */
    ajuda?: string;
    /**
     * Campo de senha, com botão de mostrar/esconder. Fica fora do
     * preenchimento automático do sistema (Samsung Pass, Google), que senão
     * oferece "salvar senha" ao entrar — com a sessão persistente isso só atrapalha.
     */
    senha?: boolean;
    /** Mostra o contador "atual/máximo" embaixo, à direita. */
    maximo?: number;
    icone?: NomeDoIcone;
    estiloDoContainer?: StyleProp<ViewStyle>;
};

/**
 * Campo de texto com rótulo em cima e erro/dica embaixo. Funciona direto com o
 * `Controller` do react-hook-form (value, onChangeText, onBlur).
 */
export const Campo = forwardRef<TextInput, Props>(function Campo(
    {
        rotulo,
        erro,
        ajuda,
        senha = false,
        maximo,
        icone,
        estiloDoContainer,
        multiline,
        editable = true,
        value,
        onFocus,
        onBlur,
        accessibilityLabel,
        importantForAutofill,
        autoComplete,
        ...resto
    },
    ref,
) {
    const [focado, setFocado] = useState(false);
    const [senhaVisivel, setSenhaVisivel] = useState(false);
    const mensagem = erro ?? ajuda;

    return (
        <View style={[estilos.campo, estiloDoContainer]}>
            <Texto variante="apoioForte">{rotulo}</Texto>
            <View
                style={[
                    estilos.caixa,
                    multiline && estilos.caixaMultilinha,
                    focado && estilos.caixaFocada,
                    !!erro && estilos.caixaComErro,
                    !editable && estilos.caixaInativa,
                ]}
            >
                {icone ? <Icone nome={icone} cor={cores.textoApagado} tamanho={20} /> : null}
                <TextInput
                    ref={ref}
                    {...resto}
                    value={value}
                    editable={editable}
                    multiline={multiline}
                    secureTextEntry={senha && !senhaVisivel}
                    importantForAutofill={importantForAutofill ?? (senha ? 'no' : undefined)}
                    autoComplete={autoComplete ?? (senha ? 'off' : undefined)}
                    placeholderTextColor={cores.textoApagado}
                    selectionColor={cores.azul}
                    accessibilityLabel={accessibilityLabel ?? rotulo}
                    onFocus={(evento) => {
                        setFocado(true);
                        onFocus?.(evento);
                    }}
                    onBlur={(evento) => {
                        setFocado(false);
                        onBlur?.(evento);
                    }}
                    style={[estilos.entrada, multiline && estilos.entradaMultilinha]}
                />
                {senha ? (
                    <Pressable
                        onPress={() => setSenhaVisivel((visivel) => !visivel)}
                        hitSlop={10}
                        accessibilityRole="button"
                        accessibilityLabel={senhaVisivel ? 'Esconder senha' : 'Mostrar senha'}
                    >
                        <Icone nome={senhaVisivel ? 'olhoFechado' : 'olho'} cor={cores.textoApagado} tamanho={20} />
                    </Pressable>
                ) : null}
            </View>
            {mensagem || maximo ? (
                <View style={estilos.rodape}>
                    <Texto variante="apoio" cor={erro ? cores.erro : cores.textoSecundario} style={estilos.mensagem}>
                        {mensagem ?? ''}
                    </Texto>
                    {maximo ? (
                        <Texto variante="apoio" cor={cores.textoSecundario} style={estilos.contador}>
                            {`${(value ?? '').length}/${maximo}`}
                        </Texto>
                    ) : null}
                </View>
            ) : null}
        </View>
    );
});

const estilos = StyleSheet.create({
    campo: { gap: 8 },
    caixa: {
        minHeight: 52,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 14,
        borderRadius: raio.controle,
        borderWidth: 1.5,
        borderColor: cores.linha,
        backgroundColor: cores.papel,
    },
    caixaMultilinha: { alignItems: 'flex-start', paddingVertical: 12 },
    caixaFocada: { borderColor: cores.azul },
    caixaComErro: { borderColor: cores.erro },
    caixaInativa: { backgroundColor: cores.chao },
    entrada: {
        flex: 1,
        paddingVertical: 12,
        fontFamily: fontes.regular,
        fontSize: 16,
        color: cores.grafite,
        includeFontPadding: false,
        outlineWidth: 0,
    },
    entradaMultilinha: { minHeight: 88, paddingVertical: 0, textAlignVertical: 'top' },
    rodape: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    mensagem: { flex: 1, fontSize: 13, lineHeight: 17 },
    contador: { fontSize: 13, lineHeight: 17 },
});
