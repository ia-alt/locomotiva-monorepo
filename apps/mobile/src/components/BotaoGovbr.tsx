import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Text, useTheme, MD3Theme } from 'react-native-paper';
import { useORPC } from '../locomotiva-api/context';

/**
 * Botão "Entrar com gov.br".
 *
 * O Passo 1 do roteiro de integração exige que a chamada de autenticação parta
 * de um botão com o texto "Entrar com gov.br", seguindo o Design System do
 * governo — é item verificado na homologação, não recomendação.
 *
 * A API monta a URL: o `state`, o `nonce` e o `code_verifier` são gerados e
 * guardados no servidor. O cliente só recebe o endereço para onde navegar.
 */
export default function BotaoGovbr({ redirectTo, onErro }: {
    redirectTo?: string | null;
    onErro?: (mensagem: string) => void;
}) {
    const theme = useTheme();
    const styles = makeStyles(theme);
    const orpc = useORPC();
    const [carregando, setCarregando] = useState(false);

    // A API é a fonte da verdade sobre a disponibilidade: assim desligar
    // `GOVBR_ENABLED` no servidor esconde o botão sem redeploy do aplicativo.
    // Enquanto não sabemos, não mostramos nada — melhor do que piscar um botão
    // que pode desaparecer.
    const [disponivel, setDisponivel] = useState<boolean | null>(null);

    useEffect(() => {
        let cancelado = false;
        orpc.identy.getGovbrStatus
            .call({})
            .then(r => { if (!cancelado) setDisponivel(r.enabled); })
            .catch(() => { if (!cancelado) setDisponivel(false); });
        return () => { cancelado = true; };
    }, []);

    const entrar = async () => {
        setCarregando(true);
        try {
            const { authorizationUrl } = await orpc.identy.startGovbrLogin.call({
                redirectTo: redirectTo ?? null,
            });
            // Navegação de página inteira, não fetch: é o navegador que precisa
            // ir até o gov.br para a pessoa autenticar lá.
            window.location.assign(authorizationUrl);
        } catch (e) {
            setCarregando(false);
            onErro?.(e instanceof Error ? e.message : 'Não foi possível iniciar o login pelo gov.br.');
        }
    };

    if (disponivel !== true) return null;

    return (
        <View style={styles.container}>
            <View style={styles.separador}>
                <View style={styles.linha} />
                <Text variant="bodySmall" style={styles.separadorTexto}>ou</Text>
                <View style={styles.linha} />
            </View>

            <Pressable
                onPress={entrar}
                disabled={carregando}
                accessibilityRole="button"
                accessibilityLabel="Entrar com gov.br"
                style={({ pressed }) => [
                    styles.botao,
                    pressed && styles.botaoPressionado,
                    carregando && styles.botaoDesabilitado,
                ]}
            >
                {carregando
                    ? <ActivityIndicator size="small" color="#FFFFFF" />
                    : (
                        <Text style={styles.rotulo}>
                            Entrar com <Text style={styles.marca}>GOV.BR</Text>
                        </Text>
                    )}
            </Pressable>

            <Text variant="bodySmall" style={styles.explicacao}>
                Use sua conta gov.br. Seus dados são confirmados pelo governo.
            </Text>
        </View>
    );
}

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
    container: { marginTop: 20 },
    separador: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
    linha: { flex: 1, height: 1, backgroundColor: theme.colors.outline, opacity: 0.5 },
    separadorTexto: { color: theme.colors.onSurfaceVariant },
    // Valores conferidos no pacote oficial @govbr-ds/core@3.7.0:
    //   #1351b4          token --blue-warm-vivid-70
    //   border-radius    100em (pílula) -> 999 no React Native
    //   height           48px = --button-large
    //   font-weight      semi-bold
    // Fixos de propósito: é marca de terceiro e não segue o tema do aplicativo.
    botao: {
        backgroundColor: '#1351B4',
        borderRadius: 999,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
        height: 48,
    },
    botaoPressionado: { backgroundColor: '#0C326F' },
    botaoDesabilitado: { opacity: 0.7 },
    rotulo: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    // O Text do Paper aninhado NÃO herda a cor do pai — aplica a cor do tema
    // (quase preta). Sem redeclarar o branco, "GOV.BR" sai escuro sobre azul.
    marca: { fontWeight: '800', color: '#FFFFFF' },
    explicacao: { color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 10 },
});
