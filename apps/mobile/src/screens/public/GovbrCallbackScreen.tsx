import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { useForm, Controller, Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MENSAGENS, dataDeNascimentoValida, telefoneCompleto } from '../../utils/validacoes';
import { useORPC } from '../../locomotiva-api/context';
import { useAuth } from '../../contexts/auth-context';
import { RetornoGovbr, linkDoAppParaCallback, stateVeioDoApp } from '../../govbr/link';
import { TelaDeAcesso, TituloDaTela } from '../../components/acesso/TelaDeAcesso';
import { Aguardando, TelaDePassagem } from '../../components/acesso/TelaDePassagem';
import { SeloDoGovbr } from '../../components/acesso/SeloDoGovbr';
import { Aviso, Botao, Campo, espaco } from '../../ui';

/** Igual ao CadastroScreen, para a pessoa digitar do mesmo jeito nas duas telas. */
const formatBirthDate = (text: string) =>
    text.replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '$1/$2')
        .replace(/(\d{2})(\d)/, '$1/$2')
        .replace(/(\/\d{4})\d+?$/, '$1');

const formatPhone = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 11);
    return digits.length <= 10
        ? digits.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d{1,4})$/, '$1-$2')
        : digits.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d{1,4})$/, '$1-$2');
};

const perfilSchema = z.object({
    birthDate: z.string().refine(dataDeNascimentoValida, MENSAGENS.dataDeNascimento),
    phone: z.string().refine(telefoneCompleto, MENSAGENS.telefone),
    company: z.string().optional(),
    jobTitle: z.string().optional(),
});
type PerfilFormValues = z.infer<typeof perfilSchema>;

const senhaSchema = z.object({
    password: z.string().min(1, 'Digite a senha da sua conta.'),
});
type SenhaFormValues = z.infer<typeof senhaSchema>;

type Etapa =
    | { tipo: 'processando' }
    | { tipo: 'abrir-app'; link: string }
    | { tipo: 'perfil'; ticket: string; nome: string | null }
    | { tipo: 'senha'; ticket: string; emailMascarado: string | null }
    | { tipo: 'erro'; mensagem: string };

/**
 * Recebe o retorno do gov.br e conclui o login.
 *
 * Montada pela raiz do app ANTES do React Navigation, porque o `linking` do
 * navegador tem prefixos fixos que não cobrem o domínio de produção — e sem
 * isso ele descarta a URL e volta para a tela inicial, levando o `code` junto.
 *
 * Os parâmetros vêm da raiz já interpretados: na web, da URL da página; no
 * aplicativo, do link do app que o reabriu. Se o login partiu do aplicativo
 * mas esta tela está rodando na web, ela não conclui nada — só devolve o
 * retorno ao app (ver `govbr/link.ts`).
 *
 * O ticket fica em estado do React, nunca em parâmetro de rota: assim não entra
 * na barra de endereço nem no histórico do navegador.
 */
export default function GovbrCallbackScreen({ retorno, onConcluir }: {
    retorno: RetornoGovbr;
    onConcluir: () => void;
}) {
    const orpc = useORPC();
    const { loginWithToken } = useAuth();

    const [etapa, setEtapa] = useState<Etapa>({ tipo: 'processando' });
    const jaProcessou = useRef(false);

    useEffect(() => {
        // O código do gov.br é de uso único: uma segunda chamada sempre falharia.
        // Em desenvolvimento o React monta o efeito duas vezes, então a trava é
        // necessária mesmo com dependências vazias.
        if (jaProcessou.current) return;
        jaProcessou.current = true;

        const { code, state, error: erroGovbr } = retorno;

        limparUrl();

        // Login iniciado pelo aplicativo, mas o gov.br só devolve para a web:
        // entrega `code` e `state` ao app pelo link dele, sem consumi-los aqui.
        // O redirecionamento automático pode ser bloqueado (o Chrome no Android
        // exige um toque para abrir esquema de app), por isso há um botão.
        if (Platform.OS === 'web' && state && stateVeioDoApp(state)) {
            const link = linkDoAppParaCallback({ code, state, error: erroGovbr });
            setEtapa({ tipo: 'abrir-app', link });
            window.location.replace(link);
            return;
        }

        if (erroGovbr) {
            setEtapa({
                tipo: 'erro',
                mensagem: erroGovbr === 'access_denied'
                    ? 'Você cancelou a autorização no gov.br.'
                    : 'O gov.br não autorizou o acesso. Tente novamente.',
            });
            return;
        }

        if (!code || !state) {
            setEtapa({ tipo: 'erro', mensagem: 'Retorno do gov.br incompleto. Tente entrar novamente.' });
            return;
        }

        orpc.identy.completeGovbrLogin
            .call({ code, state })
            .then(async (r) => {
                if (r.status === 'authenticated' && r.token && r.refreshToken) {
                    await loginWithToken(r.token, r.refreshToken);
                    onConcluir();
                    return;
                }
                if (r.status === 'needs_profile' && r.ticket) {
                    setEtapa({ tipo: 'perfil', ticket: r.ticket, nome: r.name });
                    return;
                }
                if (r.status === 'needs_password_link' && r.ticket) {
                    setEtapa({ tipo: 'senha', ticket: r.ticket, emailMascarado: r.maskedEmail });
                    return;
                }
                setEtapa({ tipo: 'erro', mensagem: 'Resposta inesperada do servidor.' });
            })
            .catch((e: unknown) => {
                setEtapa({ tipo: 'erro', mensagem: mensagemDeErro(e) });
            });
    }, []);

    if (etapa.tipo === 'processando') {
        return (
            <TelaDePassagem>
                <Aguardando mensagem="Confirmando sua identidade…" />
            </TelaDePassagem>
        );
    }

    if (etapa.tipo === 'abrir-app') {
        const link = etapa.link;
        return (
            <TelaDePassagem acoes={<Botao titulo="Abrir o aplicativo" onPress={() => window.location.assign(link)} />}>
                <Aguardando
                    mensagem="Voltando para o aplicativo…"
                    explicacao="Se o aplicativo não abrir sozinho, toque no botão."
                />
            </TelaDePassagem>
        );
    }

    if (etapa.tipo === 'erro') {
        return (
            <TelaDePassagem acoes={<Botao titulo="Voltar para o início" onPress={onConcluir} />}>
                <Aviso tom="erro" titulo="Não foi possível entrar">{etapa.mensagem}</Aviso>
            </TelaDePassagem>
        );
    }

    if (etapa.tipo === 'senha') {
        return (
            <FormularioSenha
                ticket={etapa.ticket}
                emailMascarado={etapa.emailMascarado}
                onCancelar={onConcluir}
                onErro={(m) => setEtapa({ tipo: 'erro', mensagem: m })}
            />
        );
    }

    return (
        <FormularioPerfil
            ticket={etapa.ticket}
            nome={etapa.nome}
            onErro={(m) => setEtapa({ tipo: 'erro', mensagem: m })}
            onConcluir={onConcluir}
        />
    );
}

// ─────────────────────── completar cadastro (CPF novo) ───────────────────────

function FormularioPerfil({ ticket, nome, onErro, onConcluir }: {
    ticket: string;
    nome: string | null;
    onErro: (m: string) => void;
    onConcluir: () => void;
}) {
    const orpc = useORPC();
    const { loginWithToken } = useAuth();

    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<PerfilFormValues>({
        resolver: zodResolver(perfilSchema),
        defaultValues: { birthDate: '', phone: '', company: '', jobTitle: '' },
    });

    const enviar = async (data: PerfilFormValues) => {
        try {
            const r = await orpc.identy.completeGovbrRegistration.call({
                ticket,
                birthDate: data.birthDate.split('/').reverse().join('-'),
                phone: data.phone,
                company: data.company || null,
                jobTitle: data.jobTitle || null,
            });
            await loginWithToken(r.token, r.refreshToken);
            onConcluir();
        } catch (e) {
            onErro(mensagemDeErro(e));
        }
    };

    return (
        <TelaDeAcesso>
            <View style={estilos.abertura}>
                <SeloDoGovbr />
                <TituloDaTela
                    variante="saudacao"
                    titulo={nome ? `Olá, ${primeiroNome(nome)}!` : 'Quase lá!'}
                    explicacao="Seu nome, CPF e e-mail já vieram do gov.br. Falta só isto:"
                />
            </View>

            <View style={estilos.campos}>
                <CampoDoPerfil
                    control={control} name="birthDate" rotulo="Data de nascimento"
                    placeholder="DD/MM/AAAA" formatar={formatBirthDate} maxLength={10}
                    keyboardType="numeric" erro={errors.birthDate?.message}
                    ajuda="Usada junto com seu CPF para o check-in no totem."
                />
                <CampoDoPerfil
                    control={control} name="phone" rotulo="Telefone"
                    placeholder="(00) 00000-0000" formatar={formatPhone} maxLength={15}
                    keyboardType="phone-pad" erro={errors.phone?.message}
                />
                <CampoDoPerfil
                    control={control} name="company" rotulo="Empresa/Instituição (opcional)"
                    placeholder="Nome da empresa ou instituição" erro={errors.company?.message}
                />
                <CampoDoPerfil
                    control={control} name="jobTitle" rotulo="Cargo (opcional)"
                    placeholder="Seu cargo ou função" erro={errors.jobTitle?.message}
                />
            </View>

            <Botao
                titulo="Concluir cadastro"
                tamanho="alto"
                carregando={isSubmitting}
                onPress={handleSubmit(enviar)}
            />
        </TelaDeAcesso>
    );
}

// ─────────────────── vincular conta existente (prova de posse) ───────────────────

function FormularioSenha({ ticket, emailMascarado, onCancelar, onErro }: {
    ticket: string;
    emailMascarado: string | null;
    onCancelar: () => void;
    onErro: (m: string) => void;
}) {
    const orpc = useORPC();
    const { loginWithToken } = useAuth();
    const [erroSenha, setErroSenha] = useState<string | null>(null);

    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<SenhaFormValues>({
        resolver: zodResolver(senhaSchema),
        defaultValues: { password: '' },
    });

    const enviar = async (data: SenhaFormValues) => {
        setErroSenha(null);
        try {
            const r = await orpc.identy.linkGovbrToAccount.call({ ticket, password: data.password });
            await loginWithToken(r.token, r.refreshToken);
            onCancelar();
        } catch (e) {
            // Senha errada queima o comprovante, então não adianta oferecer nova
            // tentativa aqui: a pessoa precisa recomeçar pelo gov.br.
            onErro(
                ehCredencialInvalida(e)
                    ? 'Senha incorreta. Por segurança, entre novamente com o gov.br para tentar de novo.'
                    : mensagemDeErro(e)
            );
        }
    };
    void erroSenha;

    return (
        <TelaDeAcesso>
            <View style={estilos.abertura}>
                <SeloDoGovbr />
                <TituloDaTela
                    titulo="Você já tem uma conta aqui"
                    explicacao={
                        `Encontramos um cadastro com o seu CPF${emailMascarado ? `, no e-mail ${emailMascarado}` : ''}. `
                        + 'Confirme a senha dessa conta para vinculá-la ao gov.br.'
                    }
                />
            </View>

            <Aviso tom="info">
                Depois de vincular, você escolhe como entrar: com sua senha de sempre ou pelo gov.br.
            </Aviso>

            <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                    <Campo
                        rotulo="Senha da conta existente"
                        placeholder="Sua senha"
                        senha
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        erro={errors.password?.message}
                    />
                )}
            />

            <View style={estilos.acoes}>
                <Botao
                    titulo="Vincular e entrar"
                    tamanho="alto"
                    carregando={isSubmitting}
                    onPress={handleSubmit(enviar)}
                />
                <Botao titulo="Cancelar" variante="contorno" desabilitado={isSubmitting} onPress={onCancelar} />
            </View>
        </TelaDeAcesso>
    );
}

// ────────────────────────────── auxiliares ──────────────────────────────

function CampoDoPerfil({ control, name, rotulo, placeholder, formatar, maxLength, keyboardType, erro, ajuda }: {
    control: Control<PerfilFormValues>;
    name: keyof PerfilFormValues;
    rotulo: string;
    placeholder: string;
    formatar?: (t: string) => string;
    maxLength?: number;
    keyboardType?: 'numeric' | 'phone-pad';
    erro?: string;
    ajuda?: string;
}) {
    return (
        <Controller
            control={control}
            name={name}
            render={({ field: { onChange, onBlur, value } }) => (
                <Campo
                    rotulo={rotulo}
                    placeholder={placeholder}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={(t) => onChange(formatar ? formatar(t) : t)}
                    maxLength={maxLength}
                    keyboardType={keyboardType}
                    erro={erro}
                    ajuda={ajuda}
                />
            )}
        />
    );
}

/** Tira `?code=` da barra de endereço para não ficar no histórico do navegador. */
function limparUrl() {
    if (typeof window !== 'undefined' && window.history?.replaceState) {
        window.history.replaceState({}, '', window.location.pathname);
    }
}

function primeiroNome(nome: string) {
    return nome.trim().split(/\s+/)[0];
}

function ehCredencialInvalida(e: unknown) {
    return typeof e === 'object' && e !== null && (e as { code?: string }).code === 'INVALID_CREDENTIALS';
}

function mensagemDeErro(e: unknown) {
    if (e instanceof Error && e.message) return e.message;
    return 'Não foi possível concluir o login. Tente novamente.';
}

const estilos = StyleSheet.create({
    abertura: { gap: espaco.l },
    campos: { gap: espaco.l },
    acoes: { gap: espaco.s },
});
