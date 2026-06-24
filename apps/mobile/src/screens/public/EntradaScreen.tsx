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
import { usePublicStackNavigation } from '../../navigation/PublicNavigator';
import { landing, spacing, radius, typography } from '../../design/tokens';

const LOGO_URL =
    'https://static.wixstatic.com/media/f13483_e83b4980282f49f39edd6da27f2a6515~mv2.png/v1/crop/x_162,y_0,w_340,h_299/fill/w_286,h_252,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/f13483_e83b4980282f49f39edd6da27f2a6515~mv2.png';

const FOOTER_INOVA_URL =
    'https://static.wixstatic.com/media/f13483_417382065b994775a52c0f52636a1a8f~mv2.png/v1/fill/w_127,h_43,al_c,lg_1,q_85,enc_avif,quality_auto/Ativo%209INOVA.png';

const FOOTER_SECTI_URL =
    'https://static.wixstatic.com/media/f13483_b90e46d874184c38924124d72f588c5f~mv2.png/v1/crop/x_168,y_0,w_4467,h_1137/fill/w_264,h_67,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/logo%20secti%20com%20fundo%20branco-08.png';

const SOBRE_IMAGE = require('../../../assets/foto_locomotiva.jpeg');

const SPACES = [
    {
        title: 'Mesa Circle & Square',
        tag: 'COWORKING',
        description: 'Wifi e cadeiras. Ambiente dinâmico e colaborativo.',
        capacity: '10–12 Pessoas',
        image: 'https://static.wixstatic.com/media/f13483_036b7e7eee64477f8a83b1f54fbfbd42~mv2.jpg/v1/fill/w_506,h_222,al_c,q_80,usm_0.66_1.00_0.01/f13483_036b7e7eee64477f8a83b1f54fbfbd42~mv2.jpg'
    },
    {
        title: 'Sala Multiuso',
        tag: 'REUNIÃO',
        description: 'Wifi, TV com cabo HDMI, quadro branco, pufs e cadeiras de praia.',
        capacity: 'Até 20 Pessoas',
        image: 'https://static.wixstatic.com/media/f13483_ed840ba0d0ca4e4b9658860299d83f7d~mv2.jpg/v1/fill/w_506,h_203,al_c,q_80,usm_0.66_1.00_0.01/f13483_ed840ba0d0ca4e4b9658860299d83f7d~mv2.jpg'
    },
    {
        title: 'Laboratório Maker',
        tag: 'MAKER',
        description: 'Desenvolve protótipos, aulas técnicas de eletrônica e capacitação. Impressão 3D.',
        capacity: '',
        image: 'https://static.wixstatic.com/media/f13483_a5175ec1da794ef09d6ba3389e417d00~mv2.png/v1/crop/x_5,y_0,w_714,h_406/fill/w_598,h_340,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/image%20(7).png',
    },
];

const HOW_STEPS = [
    {
        icon: 'account-plus-outline',
        title: 'Cadastro',
        description: 'Crie sua conta ou faça login no sistema.',
    },
    {
        icon: 'calendar-check-outline',
        title: 'Escolha',
        description: 'Selecione o espaço, data e horário desejado.',
    },
    {
        icon: 'check-circle-outline',
        title: 'Confirmação',
        description: 'Aguarde a aprovação do seu agendamento.',
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
                        style={styles.primaryButton}
                    >
                        <Text style={styles.primaryButtonText}>Entrar no HUB</Text>
                        <MaterialCommunityIcons name="arrow-right" size={18} color="#FFFFFF" />
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
                            <MaterialCommunityIcons name="wifi" size={26} color={landing.accent} style={styles.featureIcon} />
                            <Text style={styles.featureLabel}>Wi-Fi Rápido</Text>
                        </View>
                        <View style={styles.featureCard}>
                            <MaterialCommunityIcons name="door-open" size={26} color={landing.accent} style={styles.featureIcon} />
                            <Text style={styles.featureLabel}>Espaços Diversos</Text>
                        </View>
                    </View>

                    <Image source={SOBRE_IMAGE} style={styles.sobreImage} resizeMode="cover" />
                </View>

                {/* Espaços */}
                <View style={styles.sectionDark}>
                    <Text style={[styles.sectionTitle, styles.centered]}>Conheça nossos espaços</Text>
                    <Text style={[styles.sectionSubtitle, styles.centered]}>
                        Aqui você encontra o espaço ideal para reuniões, treinamentos, workshops, eventos,
                        coworking e muito mais! Tudo gratuito para você.
                    </Text>

                    {SPACES.map((space) => (
                        <View key={space.title} style={styles.spaceCard}>
                            <View style={styles.spaceImageContainer}>
                                <Image source={{ uri: space.image }} style={styles.spaceImage} resizeMode="cover" />
                                <View style={styles.spaceTag}>
                                    <Text style={styles.spaceTagText}>{space.tag}</Text>
                                </View>
                            </View>
                            <View style={styles.spaceContent}>
                                <Text style={styles.spaceTitle}>{space.title}</Text>
                                <Text style={styles.spaceDescription}>{space.description}</Text>
                                {space.capacity ? (
                                    <View style={styles.capacityRow}>
                                        <MaterialCommunityIcons name="account-group-outline" size={15} color={landing.accent} />
                                        <Text style={styles.spaceCapacity}>{space.capacity}</Text>
                                    </View>
                                ) : null}
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
                                <View style={styles.stepCircle}>
                                    <MaterialCommunityIcons name={step.icon as any} size={26} color={landing.accent} />
                                    <View style={styles.stepNumber}>
                                        <Text style={styles.stepNumberText}>{index + 1}</Text>
                                    </View>
                                </View>
                                <Text style={styles.stepTitle}>{step.title}</Text>
                                <Text style={styles.stepDescription}>{step.description}</Text>
                            </View>
                        ))}
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => navigation.navigate('Login')}
                        style={styles.primaryButton}
                    >
                        <Text style={styles.primaryButtonText}>Acessar Sistema</Text>
                        <MaterialCommunityIcons name="arrow-right" size={18} color="#FFFFFF" />
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
                        <Ionicons name="location-outline" size={20} color={landing.accent} />
                        <Text style={[styles.contactText, styles.contactLink]}>
                            Parque 15 de Novembro, 253 - Centro{'\n'}São Luís - MA, 65010-520
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.contactRow}
                        activeOpacity={0.7}
                        onPress={() => Linking.openURL('mailto:locomotivahub@gmail.com')}
                    >
                        <Ionicons name="mail-outline" size={20} color={landing.accent} />
                        <Text style={[styles.contactText, styles.contactLink]}>locomotivahub@gmail.com</Text>
                    </TouchableOpacity>
                    <View style={styles.contactRow}>
                        <Ionicons name="time-outline" size={20} color={landing.accent} />
                        <Text style={styles.contactText}>Segunda a sexta, das 8h às 17h</Text>
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
        backgroundColor: landing.bg,
    },
    scroll: {
        paddingBottom: spacing.xl,
    },
    centered: {
        textAlign: 'center',
    },

    // Hero
    heroSection: {
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xxl,
        paddingBottom: spacing.xl,
    },
    logo: {
        width: 150,
        height: 132,
        marginBottom: spacing.lg,
    },
    heroTitle: {
        color: landing.text,
        fontSize: 32,
        fontWeight: typography.weight.bold,
        fontFamily: typography.family,
        textAlign: 'center',
        lineHeight: 40,
        marginBottom: spacing.md,
        letterSpacing: -0.5,
    },
    heroTitleAccent: {
        color: landing.accent,
        fontFamily: typography.family,
        fontWeight: typography.weight.bold,
    },
    heroSubtitle: {
        color: landing.textMuted,
        fontSize: typography.size.md,
        fontFamily: typography.family,
        lineHeight: 24,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },

    // Botão primário — sólido, sem neon
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        width: '100%',
        backgroundColor: landing.accent,
        paddingVertical: 15,
        borderRadius: radius.md,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: typography.size.md,
        fontWeight: typography.weight.bold,
        fontFamily: typography.family,
    },

    // Sections
    section: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xl,
    },
    sectionDark: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xl,
        backgroundColor: 'rgba(0, 0, 0, 0.18)',
    },
    sectionTitle: {
        color: landing.text,
        fontSize: typography.size.xl,
        fontWeight: typography.weight.bold,
        fontFamily: typography.family,
        marginBottom: spacing.md,
    },
    sectionSubtitle: {
        color: landing.textMuted,
        fontSize: typography.size.base,
        fontFamily: typography.family,
        lineHeight: 22,
        marginBottom: spacing.lg,
    },
    sectionBody: {
        color: landing.textMuted,
        fontSize: typography.size.base,
        fontFamily: typography.family,
        lineHeight: 22,
        marginBottom: spacing.lg,
    },

    // Features
    featureRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    featureCard: {
        flex: 1,
        backgroundColor: landing.surface,
        borderWidth: 1,
        borderColor: landing.surfaceBorder,
        borderRadius: radius.md,
        padding: spacing.base,
        alignItems: 'flex-start',
    },
    featureIcon: {
        marginBottom: spacing.sm,
    },
    featureLabel: {
        color: landing.text,
        fontSize: typography.size.base,
        fontWeight: typography.weight.semibold,
        fontFamily: typography.family,
    },

    // Sobre image
    sobreImage: {
        width: '100%',
        height: 200,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: landing.surfaceBorder,
    },

    // Space cards
    spaceCard: {
        backgroundColor: landing.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: landing.surfaceBorder,
        overflow: 'hidden',
        marginBottom: spacing.base,
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
        top: spacing.md,
        left: spacing.md,
        borderRadius: radius.full,
        paddingHorizontal: spacing.md,
        paddingVertical: 5,
        backgroundColor: landing.accent,
    },
    spaceTagText: {
        color: '#FFFFFF',
        fontSize: typography.size.xs,
        fontWeight: typography.weight.bold,
        fontFamily: typography.family,
        letterSpacing: 0.8,
    },
    spaceContent: {
        padding: spacing.base,
    },
    spaceTitle: {
        color: landing.text,
        fontSize: typography.size.lg,
        fontWeight: typography.weight.bold,
        fontFamily: typography.family,
        marginBottom: spacing.xs,
    },
    spaceDescription: {
        color: landing.textMuted,
        fontSize: typography.size.base,
        fontFamily: typography.family,
        lineHeight: 20,
        marginBottom: spacing.md,
    },
    capacityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    spaceCapacity: {
        color: landing.textMuted,
        fontSize: typography.size.sm,
        fontFamily: typography.family,
    },

    // Steps
    stepsContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: spacing.lg,
        marginBottom: spacing.xl,
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
        width: 60,
        height: 60,
        borderRadius: radius.full,
        borderWidth: 1,
        borderColor: landing.surfaceBorder,
        backgroundColor: landing.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    stepNumber: {
        position: 'absolute',
        top: -6,
        right: -6,
        width: 22,
        height: 22,
        borderRadius: radius.full,
        backgroundColor: landing.accent,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepNumberText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: typography.weight.bold,
        fontFamily: typography.family,
    },
    stepTitle: {
        color: landing.text,
        fontSize: typography.size.lg,
        fontWeight: typography.weight.bold,
        fontFamily: typography.family,
        textAlign: 'center',
        marginBottom: spacing.xs,
    },
    stepDescription: {
        color: landing.textMuted,
        fontSize: typography.size.base,
        fontFamily: typography.family,
        lineHeight: 18,
        textAlign: 'center',
    },

    // Contact
    contactRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.md,
        marginBottom: spacing.base,
    },
    contactText: {
        color: landing.textMuted,
        fontSize: typography.size.base,
        fontFamily: typography.family,
        lineHeight: 22,
        flex: 1,
    },
    contactLink: {
        color: landing.accent,
    },

    // Footer
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.base,
        paddingVertical: spacing.lg,
        marginHorizontal: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: landing.divider,
    },
    footerDivider: {
        width: 1,
        height: 32,
        backgroundColor: landing.divider,
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
        color: landing.textFaint,
        fontSize: typography.size.xs,
        fontFamily: typography.family,
        textAlign: 'center',
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.base,
    },
});
