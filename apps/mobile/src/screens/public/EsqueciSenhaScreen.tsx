import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Text, TextInput, Button, Surface, useTheme, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePublicStackNavigation } from '../../navigation/PublicNavigator';
import { useORPC } from '../../locomotiva-api/context';
import { useMutation } from '@tanstack/react-query';
//import { masks } from '../../utils/masks'; // assuming they might have a mask utility

const requestSchema = z.object({
    cpf: z.string().min(11, 'O CPF é obrigatório.'), // validation logic can be enhanced
});

type RequestFormValues = z.infer<typeof requestSchema>;

export default function EsqueciSenhaScreen() {
    const navigation = usePublicStackNavigation();
    const theme = useTheme();
    const styles = makeStyles(theme);
    const orpc = useORPC();
    
    const requestResetMutation = useMutation({
        ...orpc.identy.requestPasswordResetCode.mutationOptions()
    });
    const submitting = requestResetMutation.isPending;

    const {
        control,
        handleSubmit,
        formState: { errors }
    } = useForm<RequestFormValues>({
        resolver: zodResolver(requestSchema),
        defaultValues: {
            cpf: ''
        }
    });

    const onSubmit = async (data: RequestFormValues) => {
        try {
            const rawCpf = data.cpf.replace(/[^\d]/g, '');
            const result = await requestResetMutation.mutateAsync({ cpf: rawCpf });
            navigation.navigate('VerificarCodigo', { cpf: rawCpf, maskedEmail: result?.maskedEmail });
        } catch (error) {
            console.error('Erro ao solicitar código de recuperação:', error);
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
                    <Text variant="headlineSmall" style={styles.welcomeText}>Recuperar Senha</Text>
                    <Text variant="bodyMedium" style={styles.subtitleText}>
                        Digite seu CPF abaixo para receber um código de validação de 6 dígitos no seu e-mail cadastrado.
                    </Text>
                </View>

                <View style={styles.inputContainer}>
                    <Text variant="labelMedium" style={styles.inputLabel}>CPF</Text>
                    <Controller
                        control={control}
                        name="cpf"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <>
                                <TextInput
                                    mode="outlined"
                                    placeholder="Digite seu CPF"
                                    value={value}
                                    onBlur={onBlur}
                                    onChangeText={(text) => {
                                        const digits = text.replace(/[^\d]/g, '').slice(0, 11);
                                        let masked = digits;
                                        if (digits.length > 9) masked = digits.slice(0, 3) + '.' + digits.slice(3, 6) + '.' + digits.slice(6, 9) + '-' + digits.slice(9);
                                        else if (digits.length > 6) masked = digits.slice(0, 3) + '.' + digits.slice(3, 6) + '.' + digits.slice(6);
                                        else if (digits.length > 3) masked = digits.slice(0, 3) + '.' + digits.slice(3);
                                        onChange(masked);
                                    }}
                                    error={!!errors.cpf}
                                    left={<TextInput.Icon icon="account-details" color={theme.colors.onSurfaceVariant} />}
                                    outlineColor={theme.colors.outline}
                                    activeOutlineColor={theme.colors.primary}
                                    style={styles.input}
                                    outlineStyle={styles.inputOutline}
                                    textColor={theme.colors.onSurface}
                                    keyboardType="numeric"
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
                    Enviar Código
                </Button>

                <Button
                    mode="text"
                    onPress={() => navigation.goBack()}
                    disabled={submitting}
                >
                    Voltar para Login
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
    },
    inputOutline: {
        borderRadius: 8,
    },
    errorText: {
        paddingHorizontal: 0,
        paddingTop: 4,
    },
    actionButton: {
        borderRadius: 8,
        marginTop: 8,
        marginBottom: 16,
    },
});
