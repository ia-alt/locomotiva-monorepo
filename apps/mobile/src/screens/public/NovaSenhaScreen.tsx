import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePublicStackNavigation } from '../../navigation/PublicNavigator';
import { RouteProp, useRoute } from '@react-navigation/native';
import { PublicStackParamList } from '../../navigation/PublicNavigator';
import { useORPC } from '../../locomotiva-api/context';
import { useMutation } from '@tanstack/react-query';
import { TelaDeAcesso, TituloDaTela } from '../../components/acesso/TelaDeAcesso';
import { TrajetoDaRecuperacao } from '../../components/acesso/TrajetoDaRecuperacao';
import { Aviso, BarraDeVoltar, Botao, Campo, espaco } from '../../ui';

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

    // Não sai no meio da troca, como nas etapas anteriores.
    const voltar = () => {
        if (!submitting) navigation.goBack();
    };

    return (
        <TelaDeAcesso topo={<BarraDeVoltar onVoltar={voltar} />}>
            <TrajetoDaRecuperacao atual={2} />

            <TituloDaTela titulo="Nova senha" explicacao="Defina e confirme sua nova senha de acesso." />

            {globalError ? <Aviso tom="erro">{globalError}</Aviso> : null}

            <View style={estilos.campos}>
                <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Campo
                            rotulo="Nova senha"
                            placeholder="Digite sua nova senha"
                            senha
                            value={value}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            erro={errors.password?.message}
                            ajuda="Use pelo menos 8 caracteres, com uma letra maiúscula, um número e um símbolo."
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="confirmPassword"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Campo
                            rotulo="Confirmar nova senha"
                            placeholder="Confirme sua nova senha"
                            senha
                            value={value}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            erro={errors.confirmPassword?.message}
                        />
                    )}
                />
            </View>

            <Botao
                titulo="Confirmar senha"
                tamanho="alto"
                carregando={submitting}
                onPress={handleSubmit(onSubmit)}
            />
        </TelaDeAcesso>
    );
}

const estilos = StyleSheet.create({
    campos: { gap: espaco.l },
});
