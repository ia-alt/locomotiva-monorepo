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

const verifySchema = z.object({
    code: z.string().length(6, 'O código deve conter 6 dígitos.'),
});

type VerifyFormValues = z.infer<typeof verifySchema>;

export default function VerificarCodigoScreen() {
    const navigation = usePublicStackNavigation();
    const route = useRoute<RouteProp<PublicStackParamList, 'VerificarCodigo'>>();
    const theme = useTheme();
    const styles = makeStyles(theme);
    const orpc = useORPC();
    
    const verifyCodeMutation = useMutation({
        ...orpc.identy.verifyPasswordResetCode.mutationOptions()
    });
    const submitting = verifyCodeMutation.isPending;
    const [globalError, setGlobalError] = useState('');

    const { cpf } = route.params;

    const {
        control,
        handleSubmit,
        formState: { errors }
    } = useForm<VerifyFormValues>({
        resolver: zodResolver(verifySchema),
        defaultValues: {
            code: ''
        }
    });

    const onSubmit = async (data: VerifyFormValues) => {
        setGlobalError('');
        try {
            const response = await verifyCodeMutation.mutateAsync({ cpf, code: data.code });
            if (response.valid) {
                 navigation.navigate('NovaSenha', { cpf, code: data.code });
            } else {
                 setGlobalError('Código inválido ou expirado.');
            }
        } catch (error) {
            console.error('Erro ao verificar código:', error);
            setGlobalError('Erro ao validar o código, tente novamente.');
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
                    <Text variant="headlineSmall" style={styles.welcomeText}>Validação</Text>
                    <Text variant="bodyMedium" style={styles.subtitleText}>
                        Insira o código de 6 dígitos enviado para o seu e-mail{cpf && route.params.maskedEmail ? ` (${route.params.maskedEmail})` : ''}.
                    </Text>
                </View>

                {globalError ? <Text style={styles.globalError}>{globalError}</Text> : null}

                <View style={styles.inputContainer}>
                    <Text variant="labelMedium" style={styles.inputLabel}>Código de 6 dígitos</Text>
                    <Controller
                        control={control}
                        name="code"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <>
                                <TextInput
                                    mode="outlined"
                                    placeholder="123456"
                                    value={value}
                                    onBlur={onBlur}
                                    onChangeText={(text) => onChange(text.replace(/[^\d]/g, '').slice(0, 6))}
                                    error={!!errors.code}
                                    outlineColor={theme.colors.outline}
                                    activeOutlineColor={theme.colors.primary}
                                    style={styles.input}
                                    outlineStyle={styles.inputOutline}
                                    keyboardType="numeric"
                                    maxLength={6}
                                />
                                {errors.code && (
                                    <HelperText type="error" visible={!!errors.code} style={styles.errorText}>
                                        {errors.code.message}
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
                    Avançar
                </Button>

                <Button
                    mode="text"
                    onPress={() => navigation.goBack()}
                    disabled={submitting}
                >
                    Voltar
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
        paddingTop: 40,
        paddingBottom: 40,
        alignItems: 'center',
        justifyContent: 'flex-start',
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
        textAlign: 'center',
        fontSize: 24,
        letterSpacing: 8,
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
