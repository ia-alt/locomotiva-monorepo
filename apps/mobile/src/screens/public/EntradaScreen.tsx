import React, { useRef } from 'react';
import {
    View,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Linking,
    useWindowDimensions,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePublicStackNavigation } from '../../navigation/PublicNavigator';

const LOGO_URL =
    'https://static.wixstatic.com/media/f13483_e83b4980282f49f39edd6da27f2a6515~mv2.png/v1/crop/x_162,y_0,w_340,h_299/fill/w_286,h_252,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/f13483_e83b4980282f49f39edd6da27f2a6515~mv2.png';

const FOOTER_INOVA_URL =
    'https://static.wixstatic.com/media/f13483_417382065b994775a52c0f52636a1a8f~mv2.png/v1/fill/w_127,h_43,al_c,lg_1,q_85,enc_avif,quality_auto/Ativo%209INOVA.png';

const FOOTER_SECTI_URL =
    'https://static.wixstatic.com/media/f13483_b90e46d874184c38924124d72f588c5f~mv2.png/v1/crop/x_168,y_0,w_4467,h_1137/fill/w_264,h_67,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/logo%20secti%20com%20fundo%20branco-08.png';

const SOBRE_IMAGE_URL =
    'https://static.wixstatic.com/media/f13483_d37fdb4af5b344409c50f3f041300994~mv2.jpeg/v1/fill/w_908,h_556,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/f13483_d37fdb4af5b344409c50f3f041300994~mv2.jpeg';

const SPACES = [
    {
        title: 'Mesa Circle & Square',
        tag: 'COWORKING',
        tagColor: '#00F2FF',
        description: 'Wifi e cadeiras. Ambiente dinâmico e colaborativo.',
        capacity: '10–12 Pessoas',
        image: 'https://static.wixstatic.com/media/f13483_036b7e7eee64477f8a83b1f54fbfbd42~mv2.jpg/v1/fill/w_506,h_222,al_c,q_80,usm_0.66_1.00_0.01/f13483_036b7e7eee64477f8a83b1f54fbfbd42~mv2.jpg'
    },
    {
        title: 'Sala Multiuso',
        tag: 'REUNIÃO',
        tagColor: '#8B5CF6',
        description: 'Wifi, TV com cabo HDMI, quadro branco, pufs e cadeiras de praia.',
        capacity: 'Até 20 Pessoas',
        image: 'https://static.wixstatic.com/media/f13483_ed840ba0d0ca4e4b9658860299d83f7d~mv2.jpg/v1/fill/w_506,h_203,al_c,q_80,usm_0.66_1.00_0.01/f13483_ed840ba0d0ca4e4b9658860299d83f7d~mv2.jpg'
    },
    {
        title: 'Laboratório Maker',
        tag: 'MAKER',
        tagColor: '#ddb7ff',
        description: 'Desenvolve protótipos, aulas técnicas de eletrônica e capacitação. Impressão 3D.',
        capacity: '',
        image: 'https://static.wixstatic.com/media/f13483_a5175ec1da794ef09d6ba3389e417d00~mv2.png/v1/crop/x_5,y_0,w_714,h_406/fill/w_598,h_340,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/image%20(7).png',
    },
];

const HOW_STEPS = [
    {
        icon: <Ionicons name="person-add-outline" size={26} color="#adc7ff" />,
        title: 'Cadastro',
        description: 'Crie sua conta ou faça login no sistema.',
        accentColor: '#adc7ff',
    },
    {
        icon: <MaterialCommunityIcons name="calendar-check-outline" size={26} color="#00F2FF" />,
        title: 'Escolha',
        description: 'Selecione o espaço, data e horário desejado.',
        accentColor: '#00F2FF',
    },
    {
        icon: <Ionicons name="checkmark-circle-outline" size={26} color="#8B5CF6" />,
        title: 'Confirmação',
        description: 'Aguarde a aprovação do seu agendamento.',
        accentColor: '#8B5CF6',
    },
];

export default function EntradaScreen() {
    const navigation = usePublicStackNavigation();
    const scrollRef = useRef<ScrollView>(null);
    const { width } = useWindowDimensions();
    const isWide = width >= 800;

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Top Nav */}
            <View style={styles.navbar}>
                <Text style={styles.navBrand}>LOCOMOTIVA HUB</Text>
            </View>

            <ScrollView
                ref={scrollRef}
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero */}
                <View style={styles.heroSection}>
                    <Image source={{ uri: LOGO_URL }} style={styles.logo} resizeMode="contain" />
                    <Text style={styles.heroTitle}>
                        Conecte-se ao Futuro no Melhor{' '}
                        <Text style={styles.heroTitleAccent}>Hub de Inovação</Text>
                        {' '}do Maranhão
                    </Text>
                    <Text style={styles.heroSubtitle}>
                        Coworking, Salas de Reunião e Laboratório Maker gratuitos para impulsionar seu negócio.
                    </Text>
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => navigation.navigate('Login')}
                        style={styles.gradientButtonWrapper}
                    >
                        <LinearGradient
                            colors={['#1d67cd', '#8B5CF6']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.gradientButton}
                        >
                            <Text style={styles.gradientButtonText}>Entrar no HUB →</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Sobre */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sobre a Locomotiva Hub</Text>
                    <Text style={styles.sectionBody}>
                        A Locomotiva Hub é um ambiente de estímulo à inovação que promove conexões e
                        impulsiona o ecossistema com foco no desenvolvimento de negócios de base
                        científica no Maranhão. Uma iniciativa pioneira criada pelo Governo do Estado
                        do Maranhão e gerenciada pela Secretaria da Ciência, Tecnologia e Inovação do
                        Maranhão (SECTI). O hub integra o Parque Tecnológico do Maranhão e contempla
                        auditório multiuso, espaço maker e ambiente de coworking.
                    </Text>

                    <View style={styles.featureRow}>
                        <View style={styles.featureCard}>
                            <MaterialCommunityIcons name="wifi" size={28} color="#00F2FF" style={styles.featureIconComponent} />
                            <Text style={styles.featureLabel}>Wi-Fi Rápido</Text>
                        </View>
                        <View style={styles.featureCard}>
                            <MaterialCommunityIcons name="door-open" size={28} color="#8B5CF6" style={styles.featureIconComponent} />
                            <Text style={styles.featureLabel}>Espaços Diversos</Text>
                        </View>
                    </View>

                    <Image
                        source={{ uri: SOBRE_IMAGE_URL }}
                        style={styles.sobreImage}
                        resizeMode="cover"
                    />
                </View>

                {/* Espaços */}
                <View style={styles.sectionDark}>
                    <Text style={[styles.sectionTitle, styles.centered]}>Conheça nossos espaços</Text>
                    <Text style={[styles.sectionSubtitle, styles.centered]}>
                        Aqui você encontra o espaço ideal para reservas de reuniões, treinamentos,
                        workshops, eventos, coworking e muito mais! Tudo isso gratuito para você.
                    </Text>

                    {SPACES.map((space) => (
                        <View key={space.title} style={styles.spaceCard}>
                            <View style={styles.spaceImageContainer}>
                                <Image
                                    source={{ uri: space.image }}
                                    style={styles.spaceImage}
                                    resizeMode="cover"
                                />
                                <View style={[styles.spaceTag, { borderColor: space.tagColor }]}>
                                    <Text style={[styles.spaceTagText, { color: space.tagColor }]}>
                                        {space.tag}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.spaceContent}>
                                <Text style={styles.spaceTitle}>{space.title}</Text>
                                <Text style={styles.spaceDescription}>{space.description}</Text>
                                <Text style={styles.spaceCapacity}>{space.capacity}</Text>
                                
                            </View>
                        </View>
                    ))}
                </View>

                {/* Como Agendar */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, styles.centered]}>Como Agendar</Text>

                    <View style={[styles.stepsContainer, isWide && styles.stepsContainerWide]}>
                        {HOW_STEPS.map((step, index) => (
                            <View key={step.title} style={[styles.stepItem, isWide && styles.stepItemWide]}>
                                <View style={[styles.stepCircle, { borderColor: step.accentColor, shadowColor: step.accentColor }]}>
                                    {step.icon}
                                </View>
                                <Text style={[styles.stepTitle, { color: step.accentColor }]}>
                                    {index + 1}. {step.title}
                                </Text>
                                <Text style={styles.stepDescription}>{step.description}</Text>
                            </View>
                        ))}
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => navigation.navigate('Login')}
                        style={styles.gradientButtonWrapper}
                    >
                        <LinearGradient
                            colors={['#1d67cd', '#8B5CF6']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.gradientButton}
                        >
                            <Text style={styles.gradientButtonText}>Acessar Sistema</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Contato */}
                <View style={styles.sectionDark}>
                    <Text style={styles.sectionTitle}>Contato & Endereço</Text>
                    <TouchableOpacity
                        style={styles.contactRow}
                        activeOpacity={0.7}
                        onPress={() => Linking.openURL('https://maps.app.goo.gl/3RjYze5Hfwst6g6a7')}
                    >
                        <Ionicons name="location-outline" size={20} color="#adc7ff" />
                        <Text style={[styles.contactText, styles.contactLink]}>
                            Parque 15 de Novembro, 253 - Centro{'\n'}São Luís - MA, 65010-520
                        </Text>
                    </TouchableOpacity>
                    <View style={styles.contactRow}>
                        <Ionicons name="mail-outline" size={20} color="#adc7ff" />
                        <Text
                            style={[styles.contactText, styles.contactLink]}
                            onPress={() => Linking.openURL('mailto:locomotivahub@gmail.com')}
                        >
                            locomotivahub@gmail.com
                        </Text>
                    </View>
                    <View style={styles.contactRow}>
                        <Ionicons name="time-outline" size={20} color="#adc7ff" />
                        <Text style={styles.contactText}>Segunda a sexta, das 8h às 18h</Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Image source={{ uri: FOOTER_INOVA_URL }} style={styles.footerLogoInova} resizeMode="contain" />
                    <View style={styles.footerDivider} />
                    <Image source={{ uri: FOOTER_SECTI_URL }} style={styles.footerLogoSecti} resizeMode="contain" />
                </View>

                <Text style={styles.footerCopy}>
                    © 2026 INOVA Maranhão - Locomotiva HUB. Todos os direitos reservados.
                </Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#08184B',
    },

    // Navbar
    navbar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 72,
        zIndex: 100,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 24,
        backgroundColor: 'rgba(8, 24, 75, 0.92)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    navBrand: {
        color: '#dde1ff',
        fontSize: 40,
        fontWeight: '800',
        letterSpacing: -0.3,
        fontFamily: 'HankenGrotesk',
    },

    scroll: {
        paddingTop: 72,
        paddingBottom: 32,
    },

    centered: {
        textAlign: 'center',
    },

    // Hero
    heroSection: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 48,
    },
    logo: {
        width: 160,
        height: 140,
        marginBottom: 20,
    },
    heroTitle: {
        color: '#dde1ff',
        fontSize: 34,
        fontWeight: '800',
        fontFamily: 'HankenGrotesk',
        textAlign: 'center',
        lineHeight: 42,
        marginBottom: 14,
        letterSpacing: -0.5,
    },
    heroTitleAccent: {
        color: '#00F2FF',
        fontFamily: 'HankenGrotesk',
        fontWeight: '800',
    },
    heroSubtitle: {
        color: 'rgba(193,198,213,0.9)',
        fontSize: 16,
        fontFamily: 'HankenGrotesk',
        fontWeight: '400',
        lineHeight: 26,
        textAlign: 'center',
        marginBottom: 28,
    },
    gradientButtonWrapper: {
        width: '100%',
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 6,
    },
    gradientButton: {
        paddingVertical: 13,
        paddingHorizontal: 28,
        borderRadius: 10,
        alignItems: 'center',
    },
    gradientButtonText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '700',
        fontFamily: 'HankenGrotesk',
        textAlign: 'center',
    },

    // Sections
    section: {
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    sectionDark: {
        paddingHorizontal: 24,
        paddingVertical: 40,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    sectionTitle: {
        color: '#dde1ff',
        fontSize: 26,
        fontWeight: '700',
        fontFamily: 'HankenGrotesk',
        marginBottom: 12,
    },
    sectionSubtitle: {
        color: 'rgba(193,198,213,0.85)',
        fontSize: 14,
        fontFamily: 'HankenGrotesk',
        fontWeight: '400',
        lineHeight: 22,
        marginBottom: 24,
    },
    sectionBody: {
        color: 'rgba(193,198,213,0.85)',
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 20,
    },

    // Features
    featureRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    featureCard: {
        flex: 1,
        backgroundColor: 'rgba(4, 13, 38, 0.8)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 10,
        padding: 14,
        alignItems: 'flex-start',
    },
    featureIconComponent: {
        marginBottom: 8,
    },
    featureLabel: {
        color: '#dde1ff',
        fontSize: 13,
        fontWeight: '600',
        fontFamily: 'HankenGrotesk',
    },

    // Sobre image
    sobreImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },

    // Space Cards
    spaceCard: {
        backgroundColor: 'rgba(4, 13, 38, 0.9)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
        marginBottom: 16,
    },
    spaceImageContainer: {
        position: 'relative',
    },
    spaceImage: {
        width: '100%',
        height: 180,
    },
    spaceTag: {
        position: 'absolute',
        top: 12,
        left: 12,
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 10,
        paddingVertical: 3,
        backgroundColor: 'rgba(12, 27, 78, 0.8)',
    },
    spaceTagText: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 1,
    },
    spaceContent: {
        padding: 16,
    },
    spaceTitle: {
        color: '#dde1ff',
        fontSize: 17,
        fontWeight: '700',
        fontFamily: 'HankenGrotesk',
        marginBottom: 6,
    },
    spaceDescription: {
        color: 'rgba(193,198,213,0.85)',
        fontSize: 13,
        lineHeight: 20,
        marginBottom: 10,
    },
    spaceCapacity: {
        color: 'rgba(193,198,213,0.7)',
        fontSize: 12,
        marginBottom: 14,
    },
    spaceButton: {
        paddingVertical: 10,
        borderRadius: 6,
        backgroundColor: 'rgba(24, 38, 89, 0.9)',
        alignItems: 'center',
    },
    spaceButtonText: {
        color: '#adc7ff',
        fontSize: 13,
        fontWeight: '600',
    },

    // Steps — coluna centralizada
    stepsContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: 28,
        marginBottom: 32,
    },
    stepItem: {
        alignItems: 'center',
        width: '100%',
    },
    stepsContainerWide: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    stepItemWide: {
        flex: 1,
        width: undefined,
    },
    stepCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        backgroundColor: 'rgba(4, 13, 38, 0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 5,
    },
    stepTextContainer: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 17,
        fontWeight: '700',
        fontFamily: 'HankenGrotesk',
        textAlign: 'center',
        marginBottom: 4,
    },
    stepDescription: {
        color: 'rgba(193,198,213,0.8)',
        fontSize: 13,
        lineHeight: 18,
        textAlign: 'center',
    },

    // Contact
    contactRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        marginBottom: 14,
    },
    contactText: {
        color: 'rgba(193,198,213,0.85)',
        fontSize: 14,
        lineHeight: 22,
        flex: 1,
    },
    contactLink: {
        color: '#00F2FF',
    },

    // Footer
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        paddingVertical: 20,
        marginHorizontal: 24,
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
    footerCopy: {
        color: 'rgba(193,198,213,0.5)',
        fontSize: 11,
        textAlign: 'center',
        paddingHorizontal: 24,
        paddingBottom: 16,
    },
});
