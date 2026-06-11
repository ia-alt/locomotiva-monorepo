import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Text, TextInput, Button, Surface, Icon, useTheme, HelperText } from 'react-native-paper';
import { useAuth } from '../../contexts/auth-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePublicStackNavigation } from '../../navigation/PublicNavigator';

const loginSchema = z.object({
    identifier: z.string().min(1, 'O Email ou CPF é obrigatório.'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.')
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginScreen() {
    const navigation = usePublicStackNavigation();
    const { login } = useAuth();
    const theme = useTheme();
    const styles = makeStyles(theme);
    const [showPassword, setShowPassword] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            identifier: '',
            password: ''
        }
    });

    const onSubmit = async (data: LoginFormValues) => {
        try {
            await login(data);
        } catch (error) {
            // Error is handled globally (e.g. via Toast provider)
            console.error(error);
        }
    };

    return (
        <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            style={styles.container}
            enableOnAndroid={true}
            extraScrollHeight={20}
        >
            {/* Logo Section */}
            <View style={styles.header}>
                <Surface style={styles.logoSurface} elevation={2}>

                    <Icon source={require('../../../assets/icon_locomotiva.png')} size={64} />
                </Surface>
                <Text variant="titleLarge" style={styles.appName}>Locomotiva Hub</Text>
            </View>

            {/* Card Section */}
            <Surface style={styles.card} elevation={1}>
                <View style={styles.titles}>
                    <Text variant="headlineSmall" style={styles.welcomeText}>Bem-vindo</Text>
                    <Text variant="bodyMedium" style={styles.subtitleText}>Coworking e Reservas</Text>
                </View>

                {/* Identifier Input */}
                <View style={styles.inputContainer}>
                    <Text variant="labelMedium" style={styles.inputLabel}>Email ou CPF</Text>
                    <Controller
                        control={control}
                        name="identifier"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <>
                                <TextInput
                                    mode="outlined"
                                    placeholder="Digite seu email ou CPF"
                                    value={value}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    error={!!errors.identifier}
                                    left={<TextInput.Icon icon="account" color={theme.colors.onSurfaceVariant} />}
                                    outlineColor={theme.colors.outline}
                                    activeOutlineColor={theme.colors.primary}
                                    style={styles.input}
                                    outlineStyle={styles.inputOutline}
                                    placeholderTextColor={theme.colors.onSurfaceVariant}
                                    textColor={theme.colors.onSurface}
                                    autoCapitalize="none"
                                />
                                {errors.identifier && (
                                    <HelperText type="error" visible={!!errors.identifier} style={styles.errorText}>
                                        {errors.identifier.message}
                                    </HelperText>
                                )}
                            </>
                        )}
                    />
                </View>

                {/* Password Input */}
                <View style={styles.inputContainer}>
                    <View style={styles.passwordHeader}>
                        <Text variant="labelMedium" style={styles.inputLabel}>Senha</Text>
                        <Pressable
                            onPress={() => navigation.navigate('EsqueciSenha', {})}
                            style={({ pressed }) => [
                                styles.forgotPasswordPressable,
                                pressed && { opacity: 0.7 }
                            ]}
                            hitSlop={15}
                        >
                            <Text
                                variant="labelMedium"
                                style={styles.forgotPasswordText}
                            >
                                Esqueci minha senha
                            </Text>
                        </Pressable>
                    </View>
                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <>
                                <TextInput
                                    mode="outlined"
                                    placeholder="Digite sua senha"
                                    value={value}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    error={!!errors.password}
                                    secureTextEntry={!showPassword}
                                    left={<TextInput.Icon icon="lock" color={theme.colors.onSurfaceVariant} />}
                                    right={
                                        <TextInput.Icon
                                            icon={showPassword ? "eye" : "eye-off"}
                                            color={theme.colors.onSurfaceVariant}
                                            onPress={() => setShowPassword(!showPassword)}
                                        />
                                    }
                                    outlineColor={theme.colors.outline}
                                    activeOutlineColor={theme.colors.primary}
                                    style={styles.input}
                                    outlineStyle={styles.inputOutline}
                                    placeholderTextColor={theme.colors.onSurfaceVariant}
                                    textColor={theme.colors.onSurface}
                                />
                                {errors.password && (
                                    <HelperText type="error" visible={!!errors.password} style={styles.errorText}>
                                        {errors.password.message}
                                    </HelperText>
                                )}
                            </>
                        )}
                    />
                </View>

                <Button
                    mode="contained"
                    onPress={(e) => {
                        if (e && e.preventDefault) e.preventDefault();
                        handleSubmit(onSubmit)();
                    }}
                    style={styles.loginButton}
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    buttonColor={theme.colors.primary}
                    contentStyle={{ paddingVertical: 6 }}
                    labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
                >
                    Entrar
                </Button>

                <Pressable
                    id='register-link'
                    onPress={() => navigation.navigate('Cadastro')}
                    style={({ pressed }) => [
                        styles.footer,
                        pressed && styles.footerPressed
                    ]}
                    hitSlop={20}
                >
                    <Text style={styles.footerText}>
                        Novo por aqui?{' '}
                        <Text style={styles.footerLink}>
                            Cadastre-se
                        </Text>
                    </Text>
                </Pressable>

                {/* Divider */}
                <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>Acesso Governamental Seguro</Text>
                    <View style={styles.dividerLine} />
                </View>
            </Surface>

            {/* Footer */}

        </KeyboardAwareScrollView>
    );
}

const makeStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 24,
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoSurface: {
        width: 64,
        height: 64,
        borderRadius: 16,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    appName: {
        fontWeight: 'bold',
        color: theme.colors.onSurface,
        fontSize: 22,
    },
    card: {
        width: '100%',
        backgroundColor: theme.colors.surface,
        borderRadius: 20,
        padding: 24,
    },
    titles: {
        alignItems: 'center',
        marginBottom: 32,
    },
    welcomeText: {
        fontWeight: 'bold',
        color: theme.colors.onSurface,
        fontSize: 24,
        marginBottom: 4,
    },
    subtitleText: {
        color: theme.colors.onSurfaceVariant,
        fontSize: 14,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontWeight: '600',
        color: theme.colors.onSurface,
        marginBottom: 4,
    },
    passwordHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    forgotPasswordText: {
        color: theme.colors.primary,
        fontWeight: '600',
        fontSize: 13,
    },
    forgotPasswordPressable: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        marginRight: -8,
    },
    input: {
        backgroundColor: theme.colors.surface,
    },
    inputOutline: {
        borderRadius: 8,
    },
    errorText: {
        paddingHorizontal: 0,
        paddingTop: 4,
    },
    loginButton: {
        borderRadius: 8,
        marginTop: 8,
        marginBottom: 20,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: theme.colors.outline,
    },
    dividerText: {
        color: theme.colors.onSurfaceVariant,
        paddingHorizontal: 16,
        fontSize: 12,
        fontWeight: '500',
    },
    footer: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
    },
    footerPressed: {
        backgroundColor: theme.colors.primaryContainer,
        opacity: 0.8,
    },
    footerText: {
        color: theme.colors.onSurfaceVariant,
        fontSize: 14,
    },
    footerLink: {
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
});
