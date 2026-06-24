import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Text, Surface, Icon } from 'react-native-paper';
import { useAuth } from '../../contexts/auth-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePublicStackNavigation } from '../../navigation/PublicNavigator';
import { FormField, PrimaryButton } from '../../design/components';
import { colors, spacing, radius, typography } from '../../design/tokens';

const loginSchema = z.object({
    identifier: z.string().min(1, 'O Email ou CPF é obrigatório.'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.')
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginScreen() {
    const navigation = usePublicStackNavigation();
    const { login } = useAuth();

    const { control, handleSubmit, formState: { isSubmitting } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { identifier: '', password: '' }
    });

    const onSubmit = async (data: LoginFormValues) => {
        try {
            await login(data);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            style={styles.container}
            enableOnAndroid
            extraScrollHeight={20}
        >
            {/* Logo */}
            <View style={styles.header}>
                <Surface style={styles.logoSurface} elevation={0}>
                    <Icon source={require('../../../assets/icon_locomotiva.png')} size={64} />
                </Surface>
                <Text style={styles.appName}>Locomotiva Hub</Text>
            </View>

            {/* Card */}
            <View style={styles.card}>
                <View style={styles.titles}>
                    <Text style={styles.welcomeText}>Bem-vindo</Text>
                    <Text style={styles.subtitleText}>Coworking e Reservas</Text>
                </View>

                <FormField
                    control={control}
                    name="identifier"
                    label="Email ou CPF"
                    placeholder="Digite seu email ou CPF"
                    leftIcon="account"
                    autoCapitalize="none"
                />

                {/* Senha com link "esqueci" alinhado ao label */}
                <View style={styles.passwordHeader}>
                    <Text style={styles.passwordLabel}>Senha</Text>
                    <Pressable
                        onPress={() => navigation.navigate('EsqueciSenha', {})}
                        style={({ pressed }) => [styles.forgotPressable, pressed && { opacity: 0.7 }]}
                        hitSlop={15}
                    >
                        <Text style={styles.forgotText}>Esqueci minha senha</Text>
                    </Pressable>
                </View>
                <FormField
                    control={control}
                    name="password"
                    label=""
                    placeholder="Digite sua senha"
                    leftIcon="lock"
                    secure
                />

                <PrimaryButton onPress={handleSubmit(onSubmit)} loading={isSubmitting} disabled={isSubmitting}>
                    Entrar
                </PrimaryButton>

                <Pressable
                    onPress={() => navigation.navigate('Cadastro')}
                    style={({ pressed }) => [styles.footer, pressed && styles.footerPressed]}
                    hitSlop={20}
                >
                    <Text style={styles.footerText}>
                        Novo por aqui? <Text style={styles.footerLink}>Cadastre-se</Text>
                    </Text>
                </Pressable>

                <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>Acesso Governamental Seguro</Text>
                    <View style={styles.dividerLine} />
                </View>
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
        paddingTop: spacing.xxl + spacing.base,
        paddingBottom: spacing.lg,
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    logoSurface: {
        width: 72,
        height: 72,
        borderRadius: radius.lg,
        backgroundColor: colors.brand.navy,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.base,
    },
    appName: {
        fontFamily: typography.family,
        fontWeight: typography.weight.bold,
        color: colors.text.primary,
        fontSize: typography.size.xl,
        letterSpacing: 0.2,
    },
    card: {
        width: '100%',
        backgroundColor: colors.surface.card,
        borderRadius: radius.xl,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border.subtle,
    },
    titles: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    welcomeText: {
        fontFamily: typography.family,
        fontWeight: typography.weight.bold,
        color: colors.text.primary,
        fontSize: typography.size.xxl,
        marginBottom: spacing.xs,
    },
    subtitleText: {
        fontFamily: typography.family,
        color: colors.text.secondary,
        fontSize: typography.size.base,
    },
    passwordHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    passwordLabel: {
        fontFamily: typography.family,
        fontWeight: typography.weight.semibold,
        color: colors.text.primary,
        fontSize: typography.size.base,
    },
    forgotText: {
        fontFamily: typography.family,
        color: colors.brand.blue,
        fontWeight: typography.weight.semibold,
        fontSize: typography.size.sm,
    },
    forgotPressable: {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        marginRight: -spacing.sm,
    },
    footer: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.base,
        marginTop: spacing.base,
        marginBottom: spacing.base,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radius.sm,
    },
    footerPressed: {
        backgroundColor: colors.brand.light,
        opacity: 0.8,
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
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.border.subtle,
    },
    dividerText: {
        fontFamily: typography.family,
        color: colors.text.muted,
        paddingHorizontal: spacing.base,
        fontSize: typography.size.xs,
        fontWeight: typography.weight.medium,
    },
});
