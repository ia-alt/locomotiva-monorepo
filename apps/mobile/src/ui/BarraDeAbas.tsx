import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useCorDaBaseDaMoldura } from '../contexts/layout-context';
import { Texto } from './Texto';
import { cores, fontes } from './tema';

/**
 * Barra de abas do app. A aba ativa ganha uma faixa azul em cima, na cor do
 * logo. Os ícones vêm de `tabBarIcon` de cada tela.
 */
export function BarraDeAbas({ state, descriptors, navigation }: BottomTabBarProps) {
    // Enquanto as abas estão na tela, a faixa do sistema embaixo (gestos /
    // home indicator) fica branca junto com a barra.
    const focada = useIsFocused();
    useCorDaBaseDaMoldura(focada ? cores.papel : undefined);

    return (
        <View style={estilos.barra} accessibilityRole="tablist">
            {state.routes.map((route, indice) => {
                const { options } = descriptors[route.key];
                const ativa = state.index === indice;
                const rotulo = options.title ?? route.name;
                const cor = ativa ? cores.grafite : cores.textoApagado;

                const aoTocar = () => {
                    const evento = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                    if (!ativa && !evento.defaultPrevented) {
                        navigation.navigate(route.name, route.params);
                    }
                };

                return (
                    <Pressable
                        key={route.key}
                        onPress={aoTocar}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: ativa }}
                        accessibilityLabel={options.tabBarAccessibilityLabel ?? rotulo}
                        style={estilos.aba}
                    >
                        {ativa ? <View style={estilos.faixa} /> : null}
                        {options.tabBarIcon?.({ focused: ativa, color: cor, size: 24 })}
                        <Texto variante="rotulo" cor={cor} style={ativa ? estilos.rotuloAtivo : undefined}>
                            {rotulo}
                        </Texto>
                    </Pressable>
                );
            })}
        </View>
    );
}

const estilos = StyleSheet.create({
    barra: {
        flexDirection: 'row',
        height: 58,
        backgroundColor: cores.papel,
        borderTopWidth: 1,
        borderTopColor: cores.linha,
    },
    aba: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
    },
    faixa: {
        position: 'absolute',
        top: -1,
        width: 28,
        height: 4,
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4,
        backgroundColor: cores.azul,
    },
    rotuloAtivo: { fontFamily: fontes.negrito },
});
