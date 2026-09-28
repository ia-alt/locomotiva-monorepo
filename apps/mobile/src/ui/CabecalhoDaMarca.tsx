import React from 'react';
import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Texto } from './Texto';
import { espaco } from './tema';

const LOGO = require('../../assets/icon_locomotiva_2.png');

/** Abaixo disso (Androids de 360 dp) a marca e o logo diminuem para caber ao lado da etiqueta. */
const LARGURA_COMPACTA = 380;

/**
 * Barra com o logo e o nome do app, logo abaixo da barra de status (como a do
 * Instagram ou do WhatsApp). O login fica salvo, então é aqui que a pessoa
 * vê a marca no dia a dia. `direita` recebe um complemento, como a situação do hub.
 */
export function CabecalhoDaMarca({ direita }: { direita?: React.ReactNode }) {
    const compacto = useWindowDimensions().width < LARGURA_COMPACTA;
    return (
        <View style={estilos.barra}>
            <View style={estilos.marca} accessible accessibilityRole="header" accessibilityLabel="Locomotiva Hub">
                <Image source={LOGO} style={compacto ? estilos.logoCompacto : estilos.logo} resizeMode="contain" />
                <Texto
                    variante="marca"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                    style={[estilos.nome, compacto && estilos.nomeCompacto]}
                >
                    Locomotiva Hub
                </Texto>
            </View>
            {direita}
        </View>
    );
}

const estilos = StyleSheet.create({
    barra: {
        minHeight: 48,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: espaco.m,
        paddingHorizontal: espaco.l,
    },
    marca: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 },
    logo: { width: 32, height: 33 },
    logoCompacto: { width: 28, height: 29 },
    nome: { flexShrink: 1 },
    nomeCompacto: { fontSize: 17, lineHeight: 21 },
});
