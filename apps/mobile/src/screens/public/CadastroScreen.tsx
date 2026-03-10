import React, { useState } from 'react';
import { View, StyleSheet, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, IconButton, useTheme, HelperText, Icon } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePublicStackNavigation } from '../../navigation/PublicNavigator';
import { useAuth } from '../../contexts/auth-context';

const cadastroSchema = z.object({
    name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
    email: z.email('Digite um e-mail válido.'),
    cpf: z.string().min(11, 'O CPF deve ter no mínimo 11 dígitos.'),
    birthDate: z.string().min(8, 'Data inválida.'),
    password: z.string()
        .min(8, 'Sua senha deve ter pelo menos 8 caracteres.')
        .regex(/[A-Z]/, 'A senha deve conter pelo menos  uma letra maiúscula.')
        .regex(/[0-9]/, 'A senha deve conter pelo menos um número.')
        .regex(/[^A-Za-z0-9]/, 'A senha deve conter pelo menos um símbolo.'),
    confirmPassword: z.string().min(1, 'A confirmação de senha é obrigatória.')
}).refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword']
});

type CadastroFormValues = z.infer<typeof cadastroSchema>;

const formatBirthDate = (text: string) => {
    return text
        .replace(/\D/g, '') // Remove tudo o que não é dígito
        .replace(/(\d{2})(\d)/, '$1/$2') // Coloca a primeira barra
        .replace(/(\d{2})(\d)/, '$1/$2') // Coloca a segunda barra
        .replace(/(\/\d{4})\d+?$/, '$1'); // Trava no último dígito do ano
};

const formatCPF = (text: string) => {
    return text
        .replace(/\D/g, '') // Remove tudo o que não é dígito
        .replace(/(\d{3})(\d)/, '$1.$2') // Coloca um ponto entre o terceiro e o quarto dígitos
        .replace(/(\d{3})(\d)/, '$1.$2') // Coloca um ponto entre o sexto e o sétimo dígitos
        .replace(/(\d{3})(\d{1,2})/, '$1-$2') // Coloca um hífen entre o nono e o décimo dígitos
        .replace(/(-\d{2})\d+?$/, '$1'); // Trava no último dígito
};

export default function CadastroScreen() {
    const navigation = usePublicStackNavigation();
    const theme = useTheme();
    const styles = makeStyles(theme);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<CadastroFormValues>({
        resolver: zodResolver(cadastroSchema),
        defaultValues: {
            name: '',
            email: '',
            cpf: '',
            birthDate: '',
            password: '',
            confirmPassword: ''
        }
    });

    const onSubmit = async (data: CadastroFormValues) => {
        data.birthDate = data.birthDate.split('/').reverse().join('-');
        try {
            setLoading(true);
            await register(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (

        <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
        >
            {/* Header / App Bar Customizada */}
            <View style={styles.appBar}>
                <IconButton
                    icon="chevron-left"
                    size={28}
                    iconColor={theme.colors.onSurface}
                    onPress={() => { navigation.pop() }}
                    style={styles.backButton}
                />
                <View style={styles.logoContainer}>
                    <Icon source={require('../../../assets/icon_locomotiva_2.png')} size={28} />
                    <Text variant="titleMedium" style={styles.logoText}>LOCOMOTIVA HUB</Text>
                </View>
                <View style={styles.placeholderRight} />
            </View>

            {/* Titles */}
            <View style={styles.titles}>
                <Text variant="headlineMedium" style={styles.titleText}>Criar Conta</Text>
                <Text variant="bodyMedium" style={styles.subtitleText}>
                    Junte-se ao hub de inovação e agende seu espaço.
                </Text>
            </View>

            {/* Forms */}
            <View style={styles.formContainer}>
                {/* Name Input */}
                <View style={styles.inputContainer}>
                    <Text variant="labelMedium" style={styles.inputLabel}>Nome Completo</Text>
                    <Controller
                        control={control}
                        name="name"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <>
                                <TextInput
                                    mode="outlined"
                                    placeholder="Seu nome completo"
                                    value={value}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    error={!!errors.name}
                                    right={<TextInput.Icon icon="account" color={theme.colors.onSurfaceVariant} />}
                                    outlineColor={theme.colors.outline}
                                    activeOutlineColor={theme.colors.primary}
                                    style={styles.input}
                                    outlineStyle={styles.inputOutline}
                                    placeholderTextColor={theme.colors.onSurfaceVariant}
                                    textColor={theme.colors.onSurface}
                                />
                                {errors.name && (
                                    <HelperText type="error" visible={!!errors.name} style={styles.errorText}>
                                        {errors.name.message}
                                    </HelperText>
                                )}
                            </>
                        )}
                    />
                </View>

                {/* Email Input */}
                <View style={styles.inputContainer}>
                    <Text variant="labelMedium" style={styles.inputLabel}>E-mail</Text>
                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <>
                                <TextInput
                                    mode="outlined"
                                    placeholder="exemplo@email.com"
                                    value={value}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    error={!!errors.email}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    right={<TextInput.Icon icon="email" color={theme.colors.onSurfaceVariant} />}
                                    outlineColor={theme.colors.outline}
                                    activeOutlineColor={theme.colors.primary}
                                    style={styles.input}
                                    outlineStyle={styles.inputOutline}
                                    placeholderTextColor={theme.colors.onSurfaceVariant}
                                    textColor={theme.colors.onSurface}
                                />
                                {errors.email && (
                                    <HelperText type="error" visible={!!errors.email} style={styles.errorText}>
                                        {errors.email.message}
                                    </HelperText>
                                )}
                            </>
                        )}
                    />
                </View>

                {/* CPF Input */}
                <View style={styles.inputContainer}>
                    <Text variant="labelMedium" style={styles.inputLabel}>CPF</Text>
                    <Controller
                        control={control}
                        name="cpf"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <>
                                <TextInput
                                    mode="outlined"
                                    placeholder="000.000.000-00"
                                    value={value}
                                    onBlur={onBlur}
                                    onChangeText={(text) => onChange(formatCPF(text))}
                                    error={!!errors.cpf}
                                    maxLength={14}
                                    keyboardType="numeric"
                                    right={<TextInput.Icon icon="card-account-details" color={theme.colors.onSurfaceVariant} />}
                                    outlineColor={theme.colors.outline}
                                    activeOutlineColor={theme.colors.primary}
                                    style={styles.input}
                                    outlineStyle={styles.inputOutline}
                                    placeholderTextColor={theme.colors.onSurfaceVariant}
                                    textColor={theme.colors.onSurface}
                                />
                                {errors.cpf && (
                                    <HelperText type="error" visible={!!errors.cpf} style={styles.errorText}>
                                        {errors.cpf.message}
                                    </HelperText>
                                )}
                            </>
                        )}
                    />
                </View>

                {/* Birth Date Input */}
                <View style={styles.inputContainer}>
                    <Text variant="labelMedium" style={styles.inputLabel}>Data de Nascimento</Text>
                    <Controller
                        control={control}
                        name="birthDate"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <>
                                <TextInput
                                    mode="outlined"
                                    placeholder="DD/MM/AAAA"
                                    value={value}
                                    onBlur={onBlur}
                                    onChangeText={(text) => onChange(formatBirthDate(text))}
                                    error={!!errors.birthDate}
                                    maxLength={10}
                                    keyboardType="numeric"
                                    right={<TextInput.Icon icon="calendar-month" color={theme.colors.onSurfaceVariant} />}
                                    outlineColor={theme.colors.outline}
                                    activeOutlineColor={theme.colors.primary}
                                    style={styles.input}
                                    outlineStyle={styles.inputOutline}
                                    placeholderTextColor={theme.colors.onSurfaceVariant}
                                    textColor={theme.colors.onSurface}
                                />
                                {errors.birthDate && (
                                    <HelperText type="error" visible={!!errors.birthDate} style={styles.errorText}>
                                        {errors.birthDate.message}
                                    </HelperText>
                                )}
                            </>
                        )}
                    />
                </View>

                {/* Password Input */}
                <View style={styles.inputContainer}>
                    <Text variant="labelMedium" style={styles.inputLabel}>Senha</Text>
                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <>
                                <TextInput
                                    mode="outlined"
                                    placeholder="Crie uma senha segura"
                                    value={value}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    error={!!errors.password}
                                    secureTextEntry={!showPassword}
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
                                {errors.password ? (
                                    <HelperText type="error" visible={!!errors.password} style={styles.errorText}>
                                        {errors.password.message}
                                    </HelperText>
                                ) : (
                                    <HelperText type="info" visible={true} style={styles.infoHelperText}>
                                        Sua senha deve ter pelo menos 8 caracteres, conter pelo menos uma letra maiúscula, um número e um símbolo.
                                    </HelperText>
                                )}
                            </>
                        )}
                    />
                </View>

                {/* Confirm Password Input */}
                <View style={styles.inputContainer}>
                    <Text variant="labelMedium" style={styles.inputLabel}>Confirmar Senha</Text>
                    <Controller
                        control={control}
                        name="confirmPassword"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <>
                                <TextInput
                                    mode="outlined"
                                    placeholder="Repita sua senha"
                                    value={value}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    error={!!errors.confirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                    right={
                                        <TextInput.Icon
                                            icon={showConfirmPassword ? "eye" : "eye-off"}
                                            color={theme.colors.onSurfaceVariant}
                                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                        />
                                    }
                                    outlineColor={theme.colors.outline}
                                    activeOutlineColor={theme.colors.primary}
                                    style={styles.input}
                                    outlineStyle={styles.inputOutline}
                                    placeholderTextColor={theme.colors.onSurfaceVariant}
                                    textColor={theme.colors.onSurface}
                                />
                                {errors.confirmPassword && (
                                    <HelperText type="error" visible={!!errors.confirmPassword} style={styles.errorText}>
                                        {errors.confirmPassword.message}
                                    </HelperText>
                                )}
                            </>
                        )}
                    />
                </View>
            </View>

            {/* Create Account Button */}
            <Button
                mode="contained"
                onPress={(e) => {
                    if (e && e.preventDefault) e.preventDefault();
                    handleSubmit(onSubmit)();
                }}
                loading={isSubmitting}
                disabled={isSubmitting}
                icon="arrow-right"
                contentStyle={styles.buttonContent}
                style={styles.submitButton}
                labelStyle={styles.buttonLabel}
                buttonColor={theme.colors.primary}
            >
                Criar Conta
            </Button>

            {/* Terms and Privacy Component */}
            <View style={styles.termsContainer}>
                <Text style={styles.termsText}>
                    Ao criar uma conta, você concorda com os nossos
                </Text>
                <Text style={styles.termsTextRow}>
                    <Text style={styles.termsLink} onPress={() => { }}>Termos de Serviço</Text>
                    <Text style={styles.termsText}> e </Text>
                    <Text style={styles.termsLink} onPress={() => { }}>Política de Privacidade</Text>.
                </Text>
            </View>

            {/* Login Link */}
            <View style={styles.footerContainer}>
                <Text style={styles.footerText}>
                    Já tem uma conta?{' '}
                    <Text
                        style={styles.footerLink}
                        onPress={() => { navigation.pop() }}
                    >
                        Entrar
                    </Text>
                </Text>
            </View>
        </ScrollView>
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
        paddingTop: 48,
        paddingBottom: 40,
    },
    appBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    backButton: {
        margin: 0,
        marginLeft: -12,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    logoText: {
        fontWeight: 'bold',
        color: theme.colors.onSurface,
        fontSize: 14,
        letterSpacing: 1,
    },
    placeholderRight: {
        width: 48, // to balance the back button space
    },
    titles: {
        marginBottom: 24,
    },
    titleText: {
        fontWeight: 'bold',
        color: '#111827',
        fontSize: 28,
        marginBottom: 8,
    },
    subtitleText: {
        color: '#475569',
        fontSize: 15,
        lineHeight: 22,
    },
    formContainer: {
        marginBottom: 8,
    },
    inputContainer: {
        marginBottom: 16,
    },
    inputLabel: {
        fontWeight: '600',
        color: theme.colors.onSurface,
        marginBottom: 4,
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
    infoHelperText: {
        paddingHorizontal: 0,
        paddingTop: 4,
        color: '#64748B',
        fontSize: 12,
    },
    submitButton: {
        borderRadius: 8,
        marginTop: 8,
        marginBottom: 24,
    },
    buttonContent: {
        flexDirection: 'row-reverse',
        paddingVertical: 6,
    },
    buttonLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    termsContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    termsText: {
        color: '#64748B',
        fontSize: 12,
        textAlign: 'center',
    },
    termsTextRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    termsLink: {
        color: theme.colors.primary,
        fontSize: 12,
        fontWeight: '500',
    },
    footerContainer: {
        alignItems: 'center',
    },
    footerText: {
        color: theme.colors.onSurface,
        fontSize: 14,
    },
    footerLink: {
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
});
