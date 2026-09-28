import React, { useEffect, useRef, useState } from 'react';
import { useORPC } from '../../locomotiva-api/context';
import { SaidaGovbr, linkDoAppParaLogout, marcarSaidaParaApp, limparSaidaParaApp } from '../../govbr/link';
import { Aguardando, TelaDePassagem } from '../../components/acesso/TelaDePassagem';
import { Botao } from '../../ui';

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
        <TelaDePassagem
            acoes={voltando ? (
                <>
                    <Botao titulo="Abrir o aplicativo" onPress={() => window.location.assign(linkApp)} />
                    <Botao titulo="Ir para o início" variante="contorno" onPress={() => window.location.replace('/')} />
                </>
            ) : null}
        >
            <Aguardando
                mensagem={voltando ? 'Voltando para o aplicativo…' : 'Saindo da sua conta gov.br…'}
                explicacao={voltando ? 'Se o aplicativo não abrir sozinho, toque no botão.' : undefined}
            />
        </TelaDePassagem>
    );
}
