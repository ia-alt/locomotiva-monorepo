import React from 'react';
import { GestureResponderEvent, StyleSheet, View } from 'react-native';
import { useAuth } from '../../contexts/auth-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePublicStackNavigation } from '../../navigation/PublicNavigator';
import BotaoGovbr from '../../components/BotaoGovbr';
import { TelaDeAcesso, TituloDaTela } from '../../components/acesso/TelaDeAcesso';
import { LinkDeTexto, RodapeComLink } from '../../components/acesso/LinkDeTexto';
import { Botao, CabecalhoDaMarca, Campo, espaco } from '../../ui';
import { showToast } from '../../App';

const loginSchema = z.object({
    identifier: z.string().min(1, 'O Email ou CPF é obrigatório.'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.')
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginScreen() {
    const navigation = usePublicStackNavigation();
    const { login } = useAuth();

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            identifier: '',
            password: ''
        }
    });

    const onSubmit = async (data: LoginFormValues) => {
        try {
            await login(data);
        } catch (error) {
            // Error is handled globally (e.g. via Toast provider)
            console.error(error);
        }
    };

    return (
        <TelaDeAcesso id="login-scroll" topo={<CabecalhoDaMarca />}>
            <TituloDaTela titulo="Entrar" />

            <View style={estilos.campos}>
                <Controller
                    control={control}
                    name="identifier"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Campo
                            rotulo="E-mail ou CPF"
                            placeholder="Digite seu e-mail ou CPF"
                            // Junto com a senha fora do preenchimento automático:
                            // sem os dois, o Android não oferece salvar o login.
                            importantForAutofill="no"
                            autoComplete="off"
                            value={value}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            erro={errors.identifier?.message}
                            autoCapitalize="none"
                        />
                    )}
                />

                <View style={estilos.senha}>
                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Campo
                                rotulo="Senha"
                                placeholder="Digite sua senha"
                                senha
                                value={value}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                erro={errors.password?.message}
                            />
                        )}
                    />
                    <View style={estilos.esqueci}>
                        <LinkDeTexto
                            titulo="Esqueci minha senha"
                            onPress={() => navigation.navigate('EsqueciSenha', {})}
                        />
                    </View>
                </View>
            </View>

            <Botao
                titulo="Entrar"
                tamanho="alto"
                carregando={isSubmitting}
                onPress={(e?: GestureResponderEvent) => {
                    if (e && e.preventDefault) e.preventDefault();
                    handleSubmit(onSubmit)();
                }}
            />

            <BotaoGovbr onErro={(m) => showToast(m)} />

            <RodapeComLink
                id="register-link"
                pergunta="Ainda não tem conta?"
                link="Criar conta"
                onPress={() => navigation.navigate('Cadastro')}
            />
        </TelaDeAcesso>
    );
}

const estilos = StyleSheet.create({
    campos: { gap: espaco.l },
    senha: { gap: espaco.m },
    esqueci: { alignSelf: 'flex-end' },
});
