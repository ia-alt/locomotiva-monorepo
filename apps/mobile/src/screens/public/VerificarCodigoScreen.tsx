import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePublicStackNavigation } from '../../navigation/PublicNavigator';
import { RouteProp, useRoute } from '@react-navigation/native';
import { PublicStackParamList } from '../../navigation/PublicNavigator';
import { useORPC } from '../../locomotiva-api/context';
import { useMutation } from '@tanstack/react-query';
import { AuthScaffold, FormField, PrimaryButton } from '../../design/components';
import { colors, spacing, radius, typography } from '../../design/tokens';

const verifySchema = z.object({
    code: z.string().length(6, 'O código deve conter 6 dígitos.'),
});

type VerifyFormValues = z.infer<typeof verifySchema>;

export default function VerificarCodigoScreen() {
    const navigation = usePublicStackNavigation();
    const route = useRoute<RouteProp<PublicStackParamList, 'VerificarCodigo'>>();
    const orpc = useORPC();

    const verifyCodeMutation = useMutation({
        ...orpc.identy.verifyPasswordResetCode.mutationOptions()
    });
    const submitting = verifyCodeMutation.isPending;
    const [globalError, setGlobalError] = useState('');

    const { cpf } = route.params;

    const { control, handleSubmit } = useForm<VerifyFormValues>({
        resolver: zodResolver(verifySchema),
        defaultValues: { code: '' }
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
        <AuthScaffold
            icon="email-check-outline"
            title="Validação"
            subtitle={`Insira o código de 6 dígitos enviado para o seu e-mail${route.params.maskedEmail ? ` (${route.params.maskedEmail})` : ''}.`}
            centerVertically
        >
            {globalError ? <Text style={styles.globalError}>{globalError}</Text> : null}

            <FormField
                control={control}
                name="code"
                label="Código de 6 dígitos"
                placeholder="000000"
                keyboardType="numeric"
                maxLength={6}
                format={(t) => t.replace(/[^\d]/g, '').slice(0, 6)}
                inputStyle={styles.codeInput}
            />

            <PrimaryButton onPress={handleSubmit(onSubmit)} loading={submitting} disabled={submitting}>
                Avançar
            </PrimaryButton>

            <Button
                mode="text"
                onPress={() => navigation.goBack()}
                disabled={submitting}
                textColor={colors.brand.blue}
                labelStyle={styles.backLabel}
                style={styles.backButton}
            >
                Voltar
            </Button>
        </AuthScaffold>
    );
}

const styles = StyleSheet.create({
    codeInput: {
        textAlign: 'center',
        fontSize: 26,
        letterSpacing: 10,
        fontWeight: typography.weight.bold,
    },
    globalError: {
        fontFamily: typography.family,
        color: colors.feedback.error,
        backgroundColor: '#FEF2F2',
        borderRadius: radius.sm,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.base,
        textAlign: 'center',
        fontWeight: typography.weight.semibold,
        marginBottom: spacing.base,
    },
    backButton: {
        marginTop: spacing.xs,
    },
    backLabel: {
        fontFamily: typography.family,
        fontWeight: typography.weight.semibold,
    },
});
