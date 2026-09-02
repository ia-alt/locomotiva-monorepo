import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, TextInput, Button, Surface, useTheme, HelperText, Icon, MD3Theme } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useORPC } from '../../locomotiva-api/context';
import { useAuth } from '../../contexts/auth-context';

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
    birthDate: z.string().min(10, 'Informe a data completa.'),
    phone: z.string().min(14, 'Digite um telefone válido.'),
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
 * O ticket fica em estado do React, nunca em parâmetro de rota: assim não entra
 * na barra de endereço nem no histórico do navegador.
 */
export default function GovbrCallbackScreen({ onConcluir }: { onConcluir: () => void }) {
    const theme = useTheme();
    const styles = makeStyles(theme);
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

        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        const erroGovbr = params.get('error');

        limparUrl();

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
            <View style={styles.centro}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text variant="bodyLarge" style={styles.processandoTexto}>Confirmando sua identidade…</Text>
            </View>
        );
    }

    if (etapa.tipo === 'erro') {
        return (
            <View style={styles.centro}>
                <Icon source="alert-circle-outline" size={56} color={theme.colors.error} />
                <Text variant="titleMedium" style={styles.erroTitulo}>Não foi possível entrar</Text>
                <Text variant="bodyMedium" style={styles.erroTexto}>{etapa.mensagem}</Text>
                <Button mode="contained" onPress={onConcluir} style={styles.botao}>
                    Voltar para o início
                </Button>
            </View>
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
    const theme = useTheme();
    const styles = makeStyles(theme);
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
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <Surface style={styles.card} elevation={1}>
                <View style={styles.selo}>
                    <Icon source="shield-check" size={20} color={theme.colors.primary} />
                    <Text variant="labelMedium" style={styles.seloTexto}>Identidade confirmada pelo gov.br</Text>
                </View>

                <Text variant="headlineSmall" style={styles.titulo}>
                    {nome ? `Olá, ${primeiroNome(nome)}!` : 'Quase lá!'}
                </Text>
                <Text variant="bodyMedium" style={styles.subtitulo}>
                    Seu nome, CPF e e-mail já vieram do gov.br. Falta só isto:
                </Text>

                <Campo
                    control={control} name="birthDate" label="Data de nascimento"
                    placeholder="DD/MM/AAAA" formatar={formatBirthDate} maxLength={10}
                    keyboardType="numeric" erro={errors.birthDate?.message} icone="calendar"
                    ajuda="Usada junto com seu CPF para o check-in no totem."
                />
                <Campo
                    control={control} name="phone" label="Telefone"
                    placeholder="(00) 00000-0000" formatar={formatPhone} maxLength={15}
                    keyboardType="phone-pad" erro={errors.phone?.message} icone="phone"
                />
                <Campo
                    control={control} name="company" label="Empresa/Instituição (opcional)"
                    placeholder="Nome da empresa ou instituição" erro={errors.company?.message} icone="domain"
                />
                <Campo
                    control={control} name="jobTitle" label="Cargo (opcional)"
                    placeholder="Seu cargo ou função" erro={errors.jobTitle?.message} icone="badge-account"
                />

                <Button
                    mode="contained" onPress={handleSubmit(enviar)}
                    loading={isSubmitting} disabled={isSubmitting}
                    style={styles.botao} contentStyle={styles.botaoConteudo}
                >
                    Concluir cadastro
                </Button>
            </Surface>
        </ScrollView>
    );
}

// ─────────────────── vincular conta existente (prova de posse) ───────────────────

function FormularioSenha({ ticket, emailMascarado, onCancelar, onErro }: {
    ticket: string;
    emailMascarado: string | null;
    onCancelar: () => void;
    onErro: (m: string) => void;
}) {
    const theme = useTheme();
    const styles = makeStyles(theme);
    const orpc = useORPC();
    const { loginWithToken } = useAuth();
    const [mostrarSenha, setMostrarSenha] = useState(false);
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
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <Surface style={styles.card} elevation={1}>
                <View style={styles.selo}>
                    <Icon source="shield-check" size={20} color={theme.colors.primary} />
                    <Text variant="labelMedium" style={styles.seloTexto}>Identidade confirmada pelo gov.br</Text>
                </View>

                <Text variant="headlineSmall" style={styles.titulo}>Você já tem uma conta aqui</Text>
                <Text variant="bodyMedium" style={styles.subtitulo}>
                    Encontramos um cadastro com o seu CPF
                    {emailMascarado ? `, no e-mail ${emailMascarado}` : ''}.
                    Confirme a senha dessa conta para vinculá-la ao gov.br.
                </Text>

                <View style={styles.aviso}>
                    <Icon source="information-outline" size={18} color={theme.colors.onSurfaceVariant} />
                    <Text variant="bodySmall" style={styles.avisoTexto}>
                        Depois de vincular, você escolhe como entrar: com sua senha de sempre ou pelo gov.br.
                    </Text>
                </View>

                <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <View style={styles.campo}>
                            <Text variant="labelMedium" style={styles.rotulo}>Senha da conta existente</Text>
                            <TextInput
                                mode="outlined"
                                placeholder="Sua senha"
                                value={value}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                secureTextEntry={!mostrarSenha}
                                error={!!errors.password}
                                left={<TextInput.Icon icon="lock" />}
                                right={
                                    <TextInput.Icon
                                        icon={mostrarSenha ? 'eye-off' : 'eye'}
                                        onPress={() => setMostrarSenha(v => !v)}
                                    />
                                }
                            />
                            {errors.password && (
                                <HelperText type="error" visible>{errors.password.message}</HelperText>
                            )}
                        </View>
                    )}
                />

                <Button
                    mode="contained" onPress={handleSubmit(enviar)}
                    loading={isSubmitting} disabled={isSubmitting}
                    style={styles.botao} contentStyle={styles.botaoConteudo}
                >
                    Vincular e entrar
                </Button>
                <Button mode="text" onPress={onCancelar} disabled={isSubmitting}>
                    Cancelar
                </Button>
            </Surface>
        </ScrollView>
    );
}

// ────────────────────────────── auxiliares ──────────────────────────────

function Campo({ control, name, label, placeholder, formatar, maxLength, keyboardType, erro, icone, ajuda }: {
    control: any;
    name: keyof PerfilFormValues;
    label: string;
    placeholder: string;
    formatar?: (t: string) => string;
    maxLength?: number;
    keyboardType?: 'numeric' | 'phone-pad';
    erro?: string;
    icone: string;
    ajuda?: string;
}) {
    const theme = useTheme();
    const styles = makeStyles(theme);
    return (
        <Controller
            control={control}
            name={name}
            render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.campo}>
                    <Text variant="labelMedium" style={styles.rotulo}>{label}</Text>
                    <TextInput
                        mode="outlined"
                        placeholder={placeholder}
                        value={value}
                        onBlur={onBlur}
                        onChangeText={(t) => onChange(formatar ? formatar(t) : t)}
                        maxLength={maxLength}
                        keyboardType={keyboardType}
                        error={!!erro}
                        left={<TextInput.Icon icon={icone} />}
                    />
                    {ajuda && !erro && <HelperText type="info" visible>{ajuda}</HelperText>}
                    {erro && <HelperText type="error" visible>{erro}</HelperText>}
                </View>
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

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
    centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
    processandoTexto: { color: theme.colors.onSurfaceVariant },
    erroTitulo: { marginTop: 8 },
    erroTexto: { color: theme.colors.onSurfaceVariant, textAlign: 'center' },
    scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
    card: { padding: 24, borderRadius: 16, backgroundColor: theme.colors.surface, gap: 4 },
    selo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
    seloTexto: { color: theme.colors.primary },
    titulo: { marginBottom: 4 },
    subtitulo: { color: theme.colors.onSurfaceVariant, marginBottom: 16 },
    aviso: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', backgroundColor: theme.colors.background, padding: 12, borderRadius: 8, marginBottom: 16 },
    avisoTexto: { flex: 1, color: theme.colors.onSurfaceVariant },
    campo: { marginBottom: 8 },
    rotulo: { marginBottom: 6, color: theme.colors.onSurface },
    botao: { marginTop: 16, borderRadius: 12 },
    botaoConteudo: { paddingVertical: 6 },
});
