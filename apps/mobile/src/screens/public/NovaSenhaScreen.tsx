import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
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
    const orpc = useORPC();

    const updatePasswordMutation = useMutation({
        ...orpc.identy.executePasswordResetWithCode.mutationOptions()
    });
    const submitting = updatePasswordMutation.isPending;
    const [globalError, setGlobalError] = useState('');

    const { cpf, code } = route.params;

    const { control, handleSubmit } = useForm<NewPasswordFormValues>({
        resolver: zodResolver(newPasswordSchema),
        defaultValues: { password: '', confirmPassword: '' }
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
                navigation.navigate('Login');
            } else {
                setGlobalError('Houve um problema ao trocar sua senha.');
            }
        } catch (error) {
            console.error('Erro ao trocar senha:', error);
            setGlobalError('Não foi possível trocar a senha. O código pode ter expirado.');
        }
    };

    return (
        <AuthScaffold
            icon="shield-key-outline"
            title="Nova Senha"
            subtitle="Defina e confirme sua nova senha de acesso."
            centerVertically
        >
            {globalError ? <Text style={styles.globalError}>{globalError}</Text> : null}

            <FormField
                control={control}
                name="password"
                label="Nova Senha"
                placeholder="Digite sua nova senha"
                leftIcon="lock"
                secure
                helperText="Mínimo de 8 caracteres, com uma maiúscula, um número e um símbolo."
            />

            <FormField
                control={control}
                name="confirmPassword"
                label="Confirmar Nova Senha"
                placeholder="Repita sua nova senha"
                leftIcon="lock-check"
                secure
            />

            <PrimaryButton onPress={handleSubmit(onSubmit)} loading={submitting} disabled={submitting}>
                Confirmar Senha
            </PrimaryButton>
        </AuthScaffold>
    );
}

const styles = StyleSheet.create({
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
});
