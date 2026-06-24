import React from 'react';
import { View, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Text, IconButton, Icon } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePublicStackNavigation } from '../../navigation/PublicNavigator';
import { useAuth } from '../../contexts/auth-context';
import { FormField, PrimaryButton } from '../../design/components';
import { colors, spacing, radius, typography } from '../../design/tokens';

const cadastroSchema = z.object({
    name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
    cpf: z.string().min(11, 'O CPF deve ter no mínimo 11 dígitos.'),
    birthDate: z.string().min(8, 'Data inválida.'),
    email: z.email('Digite um e-mail válido.'),
    phone: z.string().min(10, 'Digite um telefone válido.'),
    company: z.string().optional(),
    jobTitle: z.string().optional(),
    password: z.string()
        .min(8, 'Sua senha deve ter pelo menos 8 caracteres.')
        .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula.')
        .regex(/[0-9]/, 'A senha deve conter pelo menos um número.')
        .regex(/[^A-Za-z0-9]/, 'A senha deve conter pelo menos um símbolo.'),
    confirmPassword: z.string().min(1, 'A confirmação de senha é obrigatória.')
}).refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword']
});

type CadastroFormValues = z.infer<typeof cadastroSchema>;

const formatBirthDate = (text: string) =>
    text
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '$1/$2')
        .replace(/(\d{2})(\d)/, '$1/$2')
        .replace(/(\/\d{4})\d+?$/, '$1');

const formatCPF = (text: string) =>
    text
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');

const formatPhone = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 10) {
        return digits.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d{1,4})$/, '$1-$2');
    }
    return digits.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d{1,4})$/, '$1-$2');
};

/** Cabeçalho de seção — dá hierarquia ao formulário longo. */
function SectionLabel({ children }: { children: string }) {
    return <Text style={styles.sectionLabel}>{children}</Text>;
}

export default function CadastroScreen() {
    const navigation = usePublicStackNavigation();
    const { register } = useAuth();

    const { control, handleSubmit, formState: { isSubmitting } } = useForm<CadastroFormValues>({
        resolver: zodResolver(cadastroSchema),
        defaultValues: {
            name: '', cpf: '', birthDate: '', email: '', phone: '',
            company: '', jobTitle: '', password: '', confirmPassword: ''
        }
    });

    const onSubmit = async (data: CadastroFormValues) => {
        const { confirmPassword, ...rest } = data;
        rest.birthDate = rest.birthDate.split('/').reverse().join('-');
        try {
            await register(rest);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <KeyboardAwareScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            style={styles.container}
            enableOnAndroid
            extraScrollHeight={20}
        >
            {/* App bar */}
            <View style={styles.appBar}>
                <IconButton
                    icon="chevron-left"
                    size={28}
                    iconColor={colors.text.primary}
                    onPress={() => navigation.pop()}
                    style={styles.backButton}
                />
                <View style={styles.logoContainer}>
                    <Icon source={require('../../../assets/icon_locomotiva_2.png')} size={26} />
                    <Text style={styles.logoText}>LOCOMOTIVA HUB</Text>
                </View>
                <View style={styles.placeholderRight} />
            </View>

            {/* Títulos */}
            <View style={styles.titles}>
                <Text style={styles.titleText}>Criar Conta</Text>
                <Text style={styles.subtitleText}>Junte-se ao hub de inovação e agende seu espaço.</Text>
            </View>

            {/* Card único com seções */}
            <View style={styles.card}>
                <SectionLabel>Dados pessoais</SectionLabel>
                <FormField control={control} name="name" label="Nome Completo"
                    placeholder="Seu nome completo" rightIcon="account" autoCapitalize="words" />
                <FormField control={control} name="cpf" label="CPF"
                    placeholder="000.000.000-00" rightIcon="card-account-details"
                    keyboardType="numeric" maxLength={14} format={formatCPF} />
                <FormField control={control} name="birthDate" label="Data de Nascimento"
                    placeholder="DD/MM/AAAA" rightIcon="calendar-month"
                    keyboardType="numeric" maxLength={10} format={formatBirthDate} />

                <View style={styles.divider} />
                <SectionLabel>Contato</SectionLabel>
                <FormField control={control} name="email" label="E-mail"
                    placeholder="exemplo@email.com" rightIcon="email"
                    keyboardType="email-address" autoCapitalize="none" />
                <FormField control={control} name="phone" label="Telefone"
                    placeholder="(00) 00000-0000" rightIcon="phone"
                    keyboardType="phone-pad" maxLength={15} format={formatPhone} />

                <View style={styles.divider} />
                <SectionLabel>Profissional</SectionLabel>
                <FormField control={control} name="company" label="Empresa/Instituição"
                    labelHint="(opcional)" placeholder="Nome da empresa ou instituição" rightIcon="domain" />
                <FormField control={control} name="jobTitle" label="Cargo"
                    labelHint="(opcional)" placeholder="Seu cargo ou função" rightIcon="briefcase" />

                <View style={styles.divider} />
                <SectionLabel>Acesso</SectionLabel>
                <FormField control={control} name="password" label="Senha"
                    placeholder="Crie uma senha segura" secure
                    helperText="Mínimo de 8 caracteres, com uma maiúscula, um número e um símbolo." />
                <FormField control={control} name="confirmPassword" label="Confirmar Senha"
                    placeholder="Repita sua senha" secure />
            </View>

            <PrimaryButton onPress={handleSubmit(onSubmit)} loading={isSubmitting} disabled={isSubmitting} icon="arrow-right">
                Criar Conta
            </PrimaryButton>

            {/* Termos */}
            <View style={styles.termsContainer}>
                <Text style={styles.termsText}>Ao criar uma conta, você concorda com os nossos</Text>
                <Text style={styles.termsText}>
                    <Text style={styles.termsLink} onPress={() => navigation.navigate('TermosDeServico')}>Termos de Serviço</Text>
                    {' e '}
                    <Text style={styles.termsLink} onPress={() => navigation.navigate('PoliticaDePrivacidade')}>Política de Privacidade</Text>.
                </Text>
            </View>

            {/* Link de login */}
            <View style={styles.footerContainer}>
                <Text style={styles.footerText}>
                    Já tem uma conta?{' '}
                    <Text style={styles.footerLink} onPress={() => navigation.pop()}>Entrar</Text>
                </Text>
            </View>
        </KeyboardAwareScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.surface.background,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
        paddingBottom: spacing.xl,
    },
    appBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
    },
    backButton: {
        margin: 0,
        marginLeft: -spacing.md,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    logoText: {
        fontFamily: typography.family,
        fontWeight: typography.weight.bold,
        color: colors.text.primary,
        fontSize: typography.size.base,
        letterSpacing: 1,
    },
    placeholderRight: {
        width: 48,
    },
    titles: {
        marginBottom: spacing.lg,
    },
    titleText: {
        fontFamily: typography.family,
        fontWeight: typography.weight.bold,
        color: colors.text.primary,
        fontSize: typography.size.xxl,
        marginBottom: spacing.xs,
    },
    subtitleText: {
        fontFamily: typography.family,
        color: colors.text.secondary,
        fontSize: typography.size.md,
        lineHeight: 22,
    },
    card: {
        backgroundColor: colors.surface.card,
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: colors.border.subtle,
        padding: spacing.lg,
        marginBottom: spacing.lg,
    },
    sectionLabel: {
        fontFamily: typography.family,
        fontWeight: typography.weight.bold,
        color: colors.brand.navy,
        fontSize: typography.size.sm,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: spacing.md,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border.subtle,
        marginTop: spacing.xs,
        marginBottom: spacing.lg,
    },
    termsContainer: {
        alignItems: 'center',
        marginTop: spacing.base,
        marginBottom: spacing.xl,
    },
    termsText: {
        fontFamily: typography.family,
        color: colors.text.muted,
        fontSize: typography.size.xs,
        textAlign: 'center',
        lineHeight: 18,
    },
    termsLink: {
        color: colors.brand.blue,
        fontWeight: typography.weight.semibold,
    },
    footerContainer: {
        alignItems: 'center',
    },
    footerText: {
        fontFamily: typography.family,
        color: colors.text.secondary,
        fontSize: typography.size.base,
    },
    footerLink: {
        color: colors.brand.blue,
        fontWeight: typography.weight.bold,
    },
});
