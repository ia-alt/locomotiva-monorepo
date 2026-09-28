import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import * as WebBrowser from 'expo-web-browser';
import { useORPC } from '../locomotiva-api/context';
import { entregarRetornoGovbr, linkDoAppParaCallback } from '../govbr/link';
import { Texto, cores, espaco } from '../ui';

type OpcoesDoLoginGovbr = {
    redirectTo?: string | null;
    onErro?: (mensagem: string) => void;
};

/**
 * Lógica do "Entrar com gov.br", separada do desenho para ser usada tanto
 * pelo bloco completo (login e cadastro) quanto pelo botão solto da entrada.
 *
 * A API monta a URL: o `state`, o `nonce` e o `code_verifier` são gerados e
 * guardados no servidor. O cliente só recebe o endereço para onde navegar.
 *
 * Na web, a própria página navega até o gov.br. No aplicativo, o login abre
 * no navegador do sistema (o roteiro do gov.br pede para não usar WebView) e
 * o retorno volta pelo link do app — ver `govbr/link.ts`.
 */
export function useLoginGovbr({ redirectTo, onErro }: OpcoesDoLoginGovbr = {}) {
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
                client: Platform.OS === 'web' ? 'web' : 'app',
            });

            if (Platform.OS === 'web') {
                // Navegação de página inteira, não fetch: é o navegador que precisa
                // ir até o gov.br para a pessoa autenticar lá.
                window.location.assign(authorizationUrl);
                return;
            }

            // Custom Tab no Android, sessão de autenticação no iOS. A página de
            // callback (web) devolve `code` e `state` pelo link do app, o que
            // fecha o navegador e resolve esta promessa com a URL completa.
            const resultado = await WebBrowser.openAuthSessionAsync(authorizationUrl, linkDoAppParaCallback(), {
                // Só iOS: sessão privada, sem compartilhar cookies com o Safari.
                // Assim o gov.br pede senha a cada login e o sistema não exibe o
                // aviso "deseja permitir que … use acesso.gov.br para entrar".
                // No Android o Custom Tab sempre compartilha os cookies do Chrome.
                preferEphemeralSession: true,
            });
            if (resultado.type === 'success') {
                entregarRetornoGovbr(resultado.url);
            }
            // Cancelou, fechou o navegador ou já entregou: libera o botão.
            setCarregando(false);
        } catch (e) {
            setCarregando(false);
            onErro?.(e instanceof Error ? e.message : 'Não foi possível iniciar o login pelo gov.br.');
        }
    };

    return { disponivel: disponivel === true, carregando, entrar };
}

/**
 * O botão em si. O Passo 1 do roteiro de integração exige que a chamada de
 * autenticação parta de um botão com o texto "Entrar com gov.br", seguindo o
 * Design System do governo — é item verificado na homologação, não
 * recomendação. Por isso ele não segue o tema do aplicativo.
 */
export function BotaoGovbrPilula({ onPress, carregando }: { onPress: () => void; carregando: boolean }) {
    return (
        <Pressable
            onPress={onPress}
            disabled={carregando}
            accessibilityRole="button"
            accessibilityLabel="Entrar com gov.br"
            accessibilityState={{ disabled: carregando, busy: carregando }}
            style={({ pressed }) => [
                estilosDoBotao.botao,
                pressed && estilosDoBotao.botaoPressionado,
                carregando && estilosDoBotao.botaoDesabilitado,
            ]}
        >
            {carregando
                ? <ActivityIndicator size="small" color="#FFFFFF" />
                : (
                    <Text style={estilosDoBotao.rotulo}>
                        Entrar com <Text style={estilosDoBotao.marca}>GOV.BR</Text>
                    </Text>
                )}
        </Pressable>
    );
}

/**
 * Bloco "ou / Entrar com gov.br / explicação", usado no login e no cadastro.
 * Some sozinho quando o gov.br está desligado na API.
 */
export default function BotaoGovbr({ redirectTo, onErro }: OpcoesDoLoginGovbr) {
    const { disponivel, carregando, entrar } = useLoginGovbr({ redirectTo, onErro });

    if (!disponivel) return null;

    return (
        <View style={estilosDoBloco.bloco}>
            <View style={estilosDoBloco.separador}>
                <View style={estilosDoBloco.linha} />
                <Texto variante="apoio" cor={cores.textoSecundario}>ou</Texto>
                <View style={estilosDoBloco.linha} />
            </View>

            <BotaoGovbrPilula onPress={entrar} carregando={carregando} />

            <Texto variante="apoio" cor={cores.textoSecundario} style={estilosDoBloco.explicacao}>
                Use sua conta gov.br. Seus dados são confirmados pelo governo.
            </Texto>
        </View>
    );
}

// Valores conferidos no pacote oficial @govbr-ds/core@3.7.0:
//   #1351b4          token --blue-warm-vivid-70
//   border-radius    100em (pílula) -> 999 no React Native
//   height           48px = --button-large
//   font-weight      semi-bold
// Fixos de propósito: é marca de terceiro e não segue o tema do aplicativo.
const estilosDoBotao = StyleSheet.create({
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
});

const estilosDoBloco = StyleSheet.create({
    bloco: { gap: espaco.m },
    separador: { flexDirection: 'row', alignItems: 'center', gap: espaco.m, marginBottom: espaco.xs },
    linha: { flex: 1, height: 1, backgroundColor: cores.linha },
    explicacao: { textAlign: 'center' },
});
