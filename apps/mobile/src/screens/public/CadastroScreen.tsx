import React, { useState } from 'react';
import { GestureResponderEvent, StyleSheet, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MENSAGENS, cpfCompleto, dataDeNascimentoValida, telefoneCompleto } from '../../utils/validacoes';
import { usePublicStackNavigation } from '../../navigation/PublicNavigator';
import { useAuth } from '../../contexts/auth-context';
import BotaoGovbr from '../../components/BotaoGovbr';
import { TelaDeAcesso, TituloDaTela } from '../../components/acesso/TelaDeAcesso';
import { RodapeComLink } from '../../components/acesso/LinkDeTexto';
import { AceiteDosTermos } from '../../components/acesso/AceiteDosTermos';
import { BarraDeVoltar, Botao, Campo, espaco } from '../../ui';
import { showToast } from '../../App';

const cadastroSchema = z.object({
    name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
    cpf: z.string().refine(cpfCompleto, MENSAGENS.cpf),
    birthDate: z.string().refine(dataDeNascimentoValida, MENSAGENS.dataDeNascimento),
    email: z.email('Digite um e-mail válido.'),
    phone: z.string().refine(telefoneCompleto, MENSAGENS.telefone),
    company: z.string().optional(),
    jobTitle: z.string().optional(),
    password: z.string()
        .min(8, 'Sua senha deve ter pelo menos 8 caracteres.')
        .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula.')
        .regex(/[0-9]/, 'A senha deve conter pelo menos um número.')
        .regex(/[^A-Za-z0-9]/, 'A senha deve conter pelo menos um símbolo.'),
    confirmPassword: z.string().min(1, 'A confirmação de senha é obrigatória.')
}).refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword']
});

type CadastroFormValues = z.infer<typeof cadastroSchema>;

const formatBirthDate = (text: string) => {
    return text
        .replace(/\D/g, '') // Remove tudo o que não é dígito
        .replace(/(\d{2})(\d)/, '$1/$2') // Coloca a primeira barra
        .replace(/(\d{2})(\d)/, '$1/$2') // Coloca a segunda barra
        .replace(/(\/\d{4})\d+?$/, '$1'); // Trava no último dígito do ano
};

const formatCPF = (text: string) => {
    return text
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
};

const formatPhone = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 10) {
        return digits
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
    }
    return digits
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
};

export default function CadastroScreen() {
    const navigation = usePublicStackNavigation();
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<CadastroFormValues>({
        resolver: zodResolver(cadastroSchema),
        defaultValues: {
            name: '',
            cpf: '',
            birthDate: '',
            email: '',
            phone: '',
            company: '',
            jobTitle: '',
            password: '',
            confirmPassword: ''
        }
    });

    const onSubmit = async (data: CadastroFormValues) => {
        const { confirmPassword, ...rest } = data;
        rest.birthDate = rest.birthDate.split('/').reverse().join('-');
        try {
            setLoading(true);
            await register(rest);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <TelaDeAcesso topo={<BarraDeVoltar onVoltar={() => { navigation.pop() }} />}>
            <TituloDaTela
                titulo="Criar conta"
                explicacao="Junte-se ao hub de inovação e agende seu espaço."
            />

            <View style={estilos.campos}>
                <Controller
                    control={control}
                    name="name"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Campo
                            rotulo="Nome completo"
                            placeholder="Seu nome completo"
                            value={value}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            erro={errors.name?.message}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="cpf"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Campo
                            rotulo="CPF"
                            placeholder="000.000.000-00"
                            value={value}
                            onBlur={onBlur}
                            onChangeText={(text) => onChange(formatCPF(text))}
                            erro={errors.cpf?.message}
                            maxLength={14}
                            keyboardType="numeric"
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="birthDate"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Campo
                            rotulo="Data de nascimento"
                            placeholder="DD/MM/AAAA"
                            value={value}
                            onBlur={onBlur}
                            onChangeText={(text) => onChange(formatBirthDate(text))}
                            erro={errors.birthDate?.message}
                            maxLength={10}
                            keyboardType="numeric"
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Campo
                            rotulo="E-mail"
                            placeholder="exemplo@email.com"
                            value={value}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            erro={errors.email?.message}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="phone"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Campo
                            rotulo="Telefone"
                            placeholder="(00) 00000-0000"
                            value={value}
                            onBlur={onBlur}
                            onChangeText={(text) => onChange(formatPhone(text))}
                            erro={errors.phone?.message}
                            maxLength={15}
                            keyboardType="phone-pad"
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="company"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Campo
                            rotulo="Empresa/Instituição (opcional)"
                            placeholder="Nome da empresa ou instituição"
                            value={value}
                            onBlur={onBlur}
                            onChangeText={onChange}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="jobTitle"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Campo
                            rotulo="Cargo (opcional)"
                            placeholder="Seu cargo ou função"
                            value={value}
                            onBlur={onBlur}
                            onChangeText={onChange}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Campo
                            rotulo="Senha"
                            placeholder="Crie uma senha segura"
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
                            rotulo="Confirmar senha"
                            placeholder="Repita sua senha"
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
                titulo="Criar conta"
                tamanho="alto"
                carregando={isSubmitting}
                onPress={(e?: GestureResponderEvent) => {
                    if (e && e.preventDefault) e.preventDefault();
                    handleSubmit(onSubmit)();
                }}
            />

            {/* Pelo gov.br o cadastro pede só data de nascimento e telefone:
                nome, CPF e e-mail vêm confirmados, e não há senha a criar. */}
            <BotaoGovbr onErro={(m) => showToast(m)} />

            <AceiteDosTermos
                aoAbrirTermos={() => navigation.navigate('TermosDeServico')}
                aoAbrirPolitica={() => navigation.navigate('PoliticaDePrivacidade')}
            />

            <RodapeComLink pergunta="Já tem uma conta?" link="Entrar" onPress={() => { navigation.pop() }} />
        </TelaDeAcesso>
    );
}

const estilos = StyleSheet.create({
    campos: { gap: espaco.l },
});
