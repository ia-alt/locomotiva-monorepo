import React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePublicStackNavigation } from '../../navigation/PublicNavigator';
import { useORPC } from '../../locomotiva-api/context';
import { useMutation } from '@tanstack/react-query';
import { AuthScaffold, FormField, PrimaryButton } from '../../design/components';
import { colors, spacing, typography } from '../../design/tokens';

const requestSchema = z.object({
    cpf: z.string().min(11, 'O CPF é obrigatório.'),
});

type RequestFormValues = z.infer<typeof requestSchema>;

const formatCPF = (text: string) => {
    const digits = text.replace(/[^\d]/g, '').slice(0, 11);
    if (digits.length > 9) return digits.slice(0, 3) + '.' + digits.slice(3, 6) + '.' + digits.slice(6, 9) + '-' + digits.slice(9);
    if (digits.length > 6) return digits.slice(0, 3) + '.' + digits.slice(3, 6) + '.' + digits.slice(6);
    if (digits.length > 3) return digits.slice(0, 3) + '.' + digits.slice(3);
    return digits;
};

export default function EsqueciSenhaScreen() {
    const navigation = usePublicStackNavigation();
    const orpc = useORPC();

    const requestResetMutation = useMutation({
        ...orpc.identy.requestPasswordResetCode.mutationOptions()
    });
    const submitting = requestResetMutation.isPending;

    const { control, handleSubmit } = useForm<RequestFormValues>({
        resolver: zodResolver(requestSchema),
        defaultValues: { cpf: '' }
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
        <AuthScaffold
            icon="lock-reset"
            title="Recuperar Senha"
            subtitle="Digite seu CPF para receber um código de validação de 6 dígitos no seu e-mail cadastrado."
            centerVertically
        >
            <FormField
                control={control}
                name="cpf"
                label="CPF"
                placeholder="000.000.000-00"
                leftIcon="account-details"
                keyboardType="numeric"
                maxLength={14}
                format={formatCPF}
            />

            <PrimaryButton onPress={handleSubmit(onSubmit)} loading={submitting} disabled={submitting}>
                Enviar Código
            </PrimaryButton>

            <Button
                mode="text"
                onPress={() => navigation.goBack()}
                disabled={submitting}
                textColor={colors.brand.blue}
                labelStyle={styles.backLabel}
                style={styles.backButton}
            >
                Voltar para Login
            </Button>
        </AuthScaffold>
    );
}

const styles = StyleSheet.create({
    backButton: {
        marginTop: spacing.xs,
    },
    backLabel: {
        fontFamily: typography.family,
        fontWeight: typography.weight.semibold,
    },
});
