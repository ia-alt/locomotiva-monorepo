import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { usePublicStackNavigation } from '../../navigation/PublicNavigator';
import { useMolduraDaTela } from '../../contexts/layout-context';
import { BotaoGovbrPilula, useLoginGovbr } from '../../components/BotaoGovbr';
import { Botao, Texto, cores, espaco, fontes, raio, sombra } from '../../ui';
import { showToast } from '../../App';

const FOTO_DO_HUB = require('../../../assets/foto_locomotiva.jpeg');
const LOGO_BRANCO = require('../../../assets/logo_locomotiva_branco.png');

/** Quanto a placa com o nome desce sobre o texto, abaixo da foto. */
const SOBREPOSICAO_DA_PLACA = 38;
/** Altura que o resto da tela (placa, textos e botões) ocupa abaixo da foto. */
const ALTURA_ABAIXO_DA_FOTO = 440;
/** Abaixo disso (Androids de 360 dp) os textos grandes diminuem um pouco. */
const LARGURA_COMPACTA = 380;

export default function EntradaScreen() {
    const navigation = usePublicStackNavigation();
    // A foto passa por baixo da barra de status, como capa.
    useMolduraDaTela({ sobOTopo: true });
    const { width, height } = useWindowDimensions();
    const compacta = width < LARGURA_COMPACTA;
    // A foto cede espaço em telas baixas para os botões caberem sem rolar.
    const alturaDaFoto = Math.round(Math.min(440, Math.max(240, height - ALTURA_ABAIXO_DA_FOTO)));
    const govbr = useLoginGovbr({ onErro: (mensagem) => showToast(mensagem) });

    return (
        <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo} bounces={false}>
            <View style={{ height: alturaDaFoto }}>
                <Image
                    source={FOTO_DO_HUB}
                    style={estilos.foto}
                    resizeMode="cover"
                    accessibilityLabel="Sala do Locomotiva Hub, com teto de hexágonos azuis e janelas redondas"
                />
                <View style={estilos.faixaAmarela} />
                <View style={estilos.placa} accessible accessibilityRole="header" accessibilityLabel="Locomotiva Hub">
                    <Image source={LOGO_BRANCO} style={estilos.logo} />
                    <Texto
                        variante="marca"
                        cor={cores.papel}
                        style={[estilos.nomeNaPlaca, compacta && estilos.nomeNaPlacaCompacto]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                    >
                        Locomotiva Hub
                    </Texto>
                </View>
            </View>

            <View style={estilos.textos}>
                <Texto variante="chamada" style={compacta && estilos.chamadaCompacta}>
                    Estação de trabalho numa estação de trem.
                </Texto>
                <Texto variante="corpo" cor={cores.textoSecundario}>
                    Coworking, salas de reunião e laboratório maker gratuitos, no Centro de São Luís.
                </Texto>
            </View>

            <View style={estilos.acoes}>
                {govbr.disponivel ? <BotaoGovbrPilula onPress={govbr.entrar} carregando={govbr.carregando} /> : null}
                <Botao
                    titulo="Entrar com CPF e senha"
                    variante={govbr.disponivel ? 'contorno' : 'primario'}
                    onPress={() => navigation.navigate('Login')}
                />
                <View style={estilos.cadastro}>
                    <Texto variante="explicacao" cor={cores.textoSecundario}>Ainda não tem conta?</Texto>
                    <Pressable onPress={() => navigation.navigate('Cadastro')} accessibilityRole="link" hitSlop={12}>
                        <Texto variante="explicacao" cor={cores.azulTexto} style={estilos.link}>Criar conta</Texto>
                    </Pressable>
                </View>
            </View>
        </ScrollView>
    );
}

const estilos = StyleSheet.create({
    tela: { flex: 1, backgroundColor: cores.chao },
    conteudo: { flexGrow: 1 },
    foto: { width: '100%', height: '100%' },
    faixaAmarela: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 6,
        backgroundColor: cores.amarelo,
    },
    placa: {
        position: 'absolute',
        left: espaco.l,
        right: espaco.l,
        bottom: -SOBREPOSICAO_DA_PLACA,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 14,
        paddingLeft: 14,
        paddingRight: 24,
        // Pílula, como os botões e o "Entrar com GOV.BR" logo abaixo.
        borderRadius: raio.pilula,
        backgroundColor: cores.grafite,
        boxShadow: sombra.placa,
    },
    logo: { width: 48, height: 48 },
    nomeNaPlaca: { flexShrink: 1, fontSize: 23, lineHeight: 27 },
    nomeNaPlacaCompacto: { fontSize: 20, lineHeight: 24 },
    chamadaCompacta: { fontSize: 25, lineHeight: 29 },
    textos: {
        gap: espaco.m,
        paddingHorizontal: espaco.l,
        paddingTop: SOBREPOSICAO_DA_PLACA + 34,
    },
    acoes: {
        marginTop: 'auto',
        gap: 10,
        paddingHorizontal: espaco.l,
        paddingTop: espaco.xxl,
        paddingBottom: espaco.l,
    },
    cadastro: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        marginTop: 6,
    },
    link: { fontFamily: fontes.negrito },
});
