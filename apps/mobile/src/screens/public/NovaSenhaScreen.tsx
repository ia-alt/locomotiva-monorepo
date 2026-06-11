import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Text, TextInput, Button, Surface, useTheme, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePublicStackNavigation } from '../../navigation/PublicNavigator';
import { RouteProp, useRoute } from '@react-navigation/native';
import { PublicStackParamList } from '../../navigation/PublicNavigator';
import { useORPC } from '../../locomotiva-api/context';
import { useMutation } from '@tanstack/react-query';

const newPasswordSchema = z.object({
    password: z.string()
        .min(8, 'A senha deve ter pelo menos 8 caracteres.')
        .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula.')
        .regex(/[0-9]/, 'A senha deve conter pelo menos um número.')
        .regex(/[^A-Za-z0-9]/, 'A senha deve conter pelo menos um símbolo.'),
    confirmPassword: z.string().min(1, 'A confirmação de senha é obrigatória.'),
}).refine(data => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword']
});

type NewPasswordFormValues = z.infer<typeof newPasswordSchema>;

export default function NovaSenhaScreen() {
    const navigation = usePublicStackNavigation();
    const route = useRoute<RouteProp<PublicStackParamList, 'NovaSenha'>>();
    const theme = useTheme();
    const styles = makeStyles(theme);
    const orpc = useORPC();

    const updatePasswordMutation = useMutation({
        ...orpc.identy.executePasswordResetWithCode.mutationOptions()
    });
    const submitting = updatePasswordMutation.isPending;
    const [globalError, setGlobalError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const { cpf, code } = route.params;

    const {
        control,
        handleSubmit,
        formState: { errors }
    } = useForm<NewPasswordFormValues>({
        resolver: zodResolver(newPasswordSchema),
        defaultValues: {
            password: '',
            confirmPassword: ''
        }
    });

    const onSubmit = async (data: NewPasswordFormValues) => {
        setGlobalError('');
        try {
            const response = await updatePasswordMutation.mutateAsync({ 
                cpf, 
                code, 
                newPassword: data.password 
            });
            if (response.success) {
                 navigation.navigate('Login'); // Returns to login cleanly
            } else {
                 setGlobalError('Houve um problema ao trocar sua senha.');
            }
        } catch (error) {
            console.error('Erro ao trocar senha:', error);
            setGlobalError('Não foi possível trocar a senha. O código pode ter expirado.');
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
            <Surface style={styles.card} elevation={1}>
                <View style={styles.titles}>
                    <Text variant="headlineSmall" style={styles.welcomeText}>Nova Senha</Text>
                    <Text variant="bodyMedium" style={styles.subtitleText}>
                        Defina e confirme sua nova senha de acesso.
                    </Text>
                </View>

                {globalError ? <Text style={styles.globalError}>{globalError}</Text> : null}

                <View style={styles.inputContainer}>
                    <Text variant="labelMedium" style={styles.inputLabel}>Nova Senha</Text>
                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <>
                                <TextInput
                                    mode="outlined"
                                    placeholder="Digite sua nova senha"
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

                <View style={styles.inputContainer}>
                    <Text variant="labelMedium" style={styles.inputLabel}>Confirmar Nova Senha</Text>
                    <Controller
                        control={control}
                        name="confirmPassword"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <>
                                <TextInput
                                    mode="outlined"
                                    placeholder="Confirme sua nova senha"
                                    value={value}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    error={!!errors.confirmPassword}
                                    secureTextEntry={!showPassword}
                                    left={<TextInput.Icon icon="lock-check" color={theme.colors.onSurfaceVariant} />}
                                    outlineColor={theme.colors.outline}
                                    activeOutlineColor={theme.colors.primary}
                                    style={styles.input}
                                    outlineStyle={styles.inputOutline}
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

                <Button
                    mode="contained"
                    onPress={handleSubmit(onSubmit)}
                    style={styles.actionButton}
                    loading={submitting}
                    disabled={submitting}
                    buttonColor={theme.colors.primary}
                    contentStyle={{ paddingVertical: 6 }}
                    labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
                >
                    Confirmar Senha
                </Button>
            </Surface>
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
        justifyContent: 'center',
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
        marginBottom: 8,
    },
    subtitleText: {
        color: theme.colors.onSurfaceVariant,
        fontSize: 14,
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 20,
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
    globalError: {
        color: theme.colors.error,
        textAlign: 'center',
        marginBottom: 16,
        fontWeight: 'bold',
    },
    actionButton: {
        borderRadius: 8,
        marginTop: 8,
        marginBottom: 16,
    },
});
