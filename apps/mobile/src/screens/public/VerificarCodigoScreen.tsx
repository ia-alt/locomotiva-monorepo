import React, { useState } from 'react';
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
import { Aviso, BarraDeVoltar, Botao, Campo } from '../../ui';

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

    // Como o antigo botão "Voltar", não sai no meio da verificação.
    const voltar = () => {
        if (!submitting) navigation.goBack();
    };

    return (
        <TelaDeAcesso topo={<BarraDeVoltar onVoltar={voltar} />}>
            <TrajetoDaRecuperacao atual={1} />

            <TituloDaTela
                titulo="Validação"
                explicacao={`Insira o código de 6 dígitos enviado para o seu e-mail${cpf && route.params.maskedEmail ? ` (${route.params.maskedEmail})` : ''}.`}
            />

            {globalError ? <Aviso tom="erro">{globalError}</Aviso> : null}

            <Controller
                control={control}
                name="code"
                render={({ field: { onChange, onBlur, value } }) => (
                    <Campo
                        rotulo="Código de 6 dígitos"
                        placeholder="123456"
                        value={value}
                        onBlur={onBlur}
                        onChangeText={(text) => onChange(text.replace(/[^\d]/g, '').slice(0, 6))}
                        erro={errors.code?.message}
                        keyboardType="numeric"
                        maxLength={6}
                    />
                )}
            />

            <Botao
                titulo="Avançar"
                icone="seguir"
                iconeNoFim
                tamanho="alto"
                carregando={submitting}
                onPress={handleSubmit(onSubmit)}
            />
        </TelaDeAcesso>
    );
}
