import React from 'react';
import {
    View,
    StyleSheet,
    ImageBackground,
    Image,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    useWindowDimensions,
} from 'react-native';
import { Text } from 'react-native-paper';
import { usePublicStackNavigation } from '../../navigation/PublicNavigator';

const BACKGROUND_IMAGE_URL = 'https://imgproxy.domestika.org/unsafe/w:820/dpr:2/plain/src://content-items/006/888/683/Roby_Locomotiv-7965-original.jpg?1611698278'
const LOGO_URL =
    'https://static.wixstatic.com/media/f13483_e83b4980282f49f39edd6da27f2a6515~mv2.png/v1/crop/x_162,y_0,w_340,h_299/fill/w_286,h_252,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/f13483_e83b4980282f49f39edd6da27f2a6515~mv2.png';

const FOOTER_INOVA_URL =
    'https://static.wixstatic.com/media/f13483_417382065b994775a52c0f52636a1a8f~mv2.png/v1/fill/w_127,h_43,al_c,lg_1,q_85,enc_avif,quality_auto/Ativo%209INOVA.png';

const FOOTER_SECTI_URL =
    'https://static.wixstatic.com/media/f13483_b90e46d874184c38924124d72f588c5f~mv2.png/v1/crop/x_168,y_0,w_4467,h_1137/fill/w_264,h_67,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/logo%20secti%20com%20fundo%20branco-08.png';

const GALLERY_IMAGES = [
    'https://static.wixstatic.com/media/f13483_c018495ba0a340569209593ae33a5e86~mv2.jpeg/v1/fill/w_560,h_342,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/f13483_c018495ba0a340569209593ae33a5e86~mv2.jpeg',
    'https://static.wixstatic.com/media/f13483_a5175ec1da794ef09d6ba3389e417d00~mv2.png/v1/crop/x_5,y_0,w_714,h_406/fill/w_598,h_340,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/image%20(7).png',
    'https://static.wixstatic.com/media/f13483_d37fdb4af5b344409c50f3f041300994~mv2.jpeg/v1/fill/w_908,h_556,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/f13483_d37fdb4af5b344409c50f3f041300994~mv2.jpeg',
];

const BORDER_PAD = 3;
const MAX_W = 800;

export default function EntradaScreen() {
    const navigation = usePublicStackNavigation();
    const { width: W } = useWindowDimensions();

    const base = Math.min(W, MAX_W);
    const sideW   = base * 0.28;
    const sideH   = sideW * 0.72;
    const centerW = base * 0.32;
    const centerH = centerW * 0.72;

    const containerW = base - 48;
    const containerH = centerH + 24;

    const inner = (
        <>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <View style={styles.overlay} />

            {/* Botão Entrar — canto superior direito */}
            <TouchableOpacity
                style={styles.enterButton}
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.8}
            >
                <Text style={styles.enterButtonText}>Entrar</Text>
            </TouchableOpacity>

            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                <Image source={{ uri: LOGO_URL }} style={styles.logo} resizeMode="contain" />

                <Text style={styles.tagline}>
                    O HUB DE INOVAÇÃO E COWORKING EM UM SÓ LUGAR!
                </Text>

                <Text style={styles.sectionTitle}>A LOCOMOTIVA HUB</Text>

                <Text style={styles.sectionBody}>
                    A Locomotiva Hub é um ambiente de estímulo à inovação que promove conexões e
                    impulsiona o ecossistema com foco no desenvolvimento de negócios de base
                    científica no Maranhão. Uma iniciativa pioneira criada pelo Governo do Estado
                    do Maranhão e gerenciado pela Secretaria da Ciência, Tecnologia e Inovação do
                    Maranhão (SECTI). O hub integra o Parque Tecnológico do Maranhão e contempla
                    auditório multiuso, espaço maker e ambiente de coworking que possibilitam
                    conexões entre o mundo acadêmico e os demais atores do ecossistema de inovação.
                </Text>

                {/*
                  Container transparente — sem fundo branco.
                  Cada foto tem sua própria moldura branca (padding + backgroundColor).
                */}
                <View style={{ width: containerW, height: containerH, alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>

                    {/* Foto esquerda — atrás, inclinada */}
                    <View style={[
                        styles.photoFrame,
                        {
                            width: sideW + BORDER_PAD * 2,
                            height: sideH + BORDER_PAD * 2,
                            position: 'absolute',
                            left: 0,
                            zIndex: 1,
                            transform: [{ rotate: '-8deg' }],
                        },
                    ]}>
                        <Image
                            source={{ uri: GALLERY_IMAGES[0] }}
                            style={{ width: sideW, height: sideH, borderRadius: 3 }}
                            resizeMode="cover"
                        />
                    </View>

                    {/* Foto direita — atrás, inclinada */}
                    <View style={[
                        styles.photoFrame,
                        {
                            width: sideW + BORDER_PAD * 2,
                            height: sideH + BORDER_PAD * 2,
                            position: 'absolute',
                            right: 0,
                            zIndex: 1,
                            transform: [{ rotate: '8deg' }],
                        },
                    ]}>
                        <Image
                            source={{ uri: GALLERY_IMAGES[1] }}
                            style={{ width: sideW, height: sideH, borderRadius: 3 }}
                            resizeMode="cover"
                        />
                    </View>

                    {/* Foto central — frente, sem inclinação */}
                    <View style={[
                        styles.photoFrame,
                        {
                            width: centerW + BORDER_PAD * 2,
                            height: centerH + BORDER_PAD * 2,
                            position: 'absolute',
                            zIndex: 2,
                        },
                    ]}>
                        <Image
                            source={{ uri: GALLERY_IMAGES[2] }}
                            style={{ width: centerW, height: centerH, borderRadius: 3 }}
                            resizeMode="cover"
                        />
                    </View>

                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Image source={{ uri: FOOTER_INOVA_URL }} style={styles.footerLogoInova} resizeMode="contain" />
                    <View style={styles.footerDivider} />
                    <Image source={{ uri: FOOTER_SECTI_URL }} style={styles.footerLogoSecti} resizeMode="contain" />
                </View>
            </ScrollView>
        </>
    );

    if (BACKGROUND_IMAGE_URL) {
        return (
            <ImageBackground source={{ uri: BACKGROUND_IMAGE_URL }} style={styles.root} resizeMode="cover">
                {inner}
            </ImageBackground>
        );
    }

    return <View style={styles.root}>{inner}</View>;
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#0a1628',
    },
    overlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(8, 20, 50, 0.88)',
    },
    enterButton: {
        position: 'absolute',
        top: 52,
        right: 20,
        zIndex: 10,
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.6)',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    enterButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    scroll: {
        paddingTop: 100,
        paddingHorizontal: 24,
        paddingBottom: 40,
        alignItems: 'center',
    },
    logo: {
        width: 160,
        height: 140,
        marginBottom: 8,
    },
    tagline: {
        color: 'rgba(200,220,255,0.85)',
        fontSize: 11,
        textAlign: 'center',
        letterSpacing: 1,
        marginBottom: 28,
    },
    sectionTitle: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    sectionBody: {
        color: 'rgba(200,220,255,0.80)',
        fontSize: 12,
        lineHeight: 19,
        marginBottom: 28,
    },
    // Moldura branca individual de cada foto (efeito polaroid)
    photoFrame: {
        backgroundColor: '#ffffff',
        padding: BORDER_PAD,
        borderRadius: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.35,
        shadowRadius: 5,
        elevation: 4,
    },
    footer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        paddingVertical: 14,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.15)',
    },
    footerDivider: {
        width: 1,
        height: 32,
        backgroundColor: 'rgba(255,255,255,0.25)',
    },
    footerLogoInova: {
        width: 90,
        height: 30,
    },
    footerLogoSecti: {
        width: 130,
        height: 33,
    },
});
