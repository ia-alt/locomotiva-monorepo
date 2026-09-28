import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MENSAGENS, cpfCompleto } from '../../utils/validacoes';
import { usePublicStackNavigation } from '../../navigation/PublicNavigator';
import { useORPC } from '../../locomotiva-api/context';
import { useMutation } from '@tanstack/react-query';
import { TelaDeAcesso, TituloDaTela } from '../../components/acesso/TelaDeAcesso';
import { TrajetoDaRecuperacao } from '../../components/acesso/TrajetoDaRecuperacao';
import { BarraDeVoltar, Botao, Campo } from '../../ui';
//import { masks } from '../../utils/masks'; // assuming they might have a mask utility

const requestSchema = z.object({
    cpf: z.string().refine(cpfCompleto, MENSAGENS.cpf),
});

type RequestFormValues = z.infer<typeof requestSchema>;

export default function EsqueciSenhaScreen() {
    const navigation = usePublicStackNavigation();
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

    // Como o antigo botão "Voltar para Login", não sai no meio do envio.
    const voltar = () => {
        if (!submitting) navigation.goBack();
    };

    return (
        <TelaDeAcesso topo={<BarraDeVoltar onVoltar={voltar} />}>
            <TrajetoDaRecuperacao atual={0} />

            <TituloDaTela
                titulo="Recuperar senha"
                explicacao="Digite seu CPF para receber um código de 6 dígitos no seu e-mail cadastrado."
            />

            <Controller
                control={control}
                name="cpf"
                render={({ field: { onChange, onBlur, value } }) => (
                    <Campo
                        rotulo="CPF"
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
                        erro={errors.cpf?.message}
                        keyboardType="numeric"
                    />
                )}
            />

            <Botao
                titulo="Enviar código"
                tamanho="alto"
                carregando={submitting}
                onPress={handleSubmit(onSubmit)}
            />
        </TelaDeAcesso>
    );
}
