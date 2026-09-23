import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, Button, useTheme, MD3Theme } from 'react-native-paper';
import { useORPC } from '../../locomotiva-api/context';
import { SaidaGovbr, linkDoAppParaLogout, marcarSaidaParaApp, limparSaidaParaApp } from '../../govbr/link';

/**
 * Saída do gov.br quando o login partiu do aplicativo. Roda só na web, dentro
 * do navegador que o app abriu (ver `govbr/link.ts`):
 *
 * - `iniciar`: o app acabou de abrir esta página. Deixa a marca "voltar ao
 *   app" e navega para o logout do gov.br, que devolve para a home.
 * - `voltar-ao-app`: a home foi aberta com a marca. Reabre o app pelo link
 *   dele, o que fecha este navegador.
 *
 * Nada aqui depende de sessão: a local já foi encerrada pelo app antes de
 * abrir esta página. Falhar em qualquer ponto só significa não encerrar a
 * sessão do gov.br — e o caminho é voltar ao app do mesmo jeito.
 */
export default function GovbrSaidaScreen({ modo }: { modo: SaidaGovbr }) {
    const theme = useTheme();
    const styles = makeStyles(theme);
    const orpc = useORPC();
    const [linkApp] = useState(() => linkDoAppParaLogout());
    const jaRodou = useRef(false);

    useEffect(() => {
        if (jaRodou.current) return;
        jaRodou.current = true;

        const voltarAoApp = () => {
            limparSaidaParaApp();
            window.location.replace(linkApp);
        };

        if (modo === 'voltar-ao-app') {
            voltarAoApp();
            return;
        }

        marcarSaidaParaApp();
        orpc.identy.getGovbrLogoutUrl
            .call({ client: 'web' })
            .then(({ url }) => {
                // Sem URL = integração desligada: não há sessão gov.br a encerrar.
                if (url) window.location.replace(url);
                else voltarAoApp();
            })
            .catch(voltarAoApp);
    }, []);

    const voltando = modo === 'voltar-ao-app';

    return (
        <View style={styles.centro}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text variant="bodyLarge" style={styles.texto}>
                {voltando ? 'Voltando para o aplicativo…' : 'Saindo da sua conta gov.br…'}
            </Text>
            {voltando && (
                <>
                    <Text variant="bodyMedium" style={styles.ajuda}>
                        Se o aplicativo não abrir sozinho, toque no botão.
                    </Text>
                    <Button mode="contained" onPress={() => window.location.assign(linkApp)} style={styles.botao}>
                        Abrir o aplicativo
                    </Button>
                    <Button mode="text" onPress={() => window.location.replace('/')}>
                        Ir para o início
                    </Button>
                </>
            )}
        </View>
    );
}

const makeStyles = (theme: MD3Theme) => StyleSheet.create({
    centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
    texto: { color: theme.colors.onSurfaceVariant },
    ajuda: { color: theme.colors.onSurfaceVariant, textAlign: 'center' },
    botao: { marginTop: 16, borderRadius: 12 },
});
