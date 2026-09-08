import { useEffect, useState } from 'react';
import * as Linking from 'expo-linking';
import appJson from '../../app.json';

/**
 * Retorno do login gov.br nas três plataformas.
 *
 * O gov.br só devolve a pessoa para a URL HTTPS cadastrada na credencial, que
 * é a da versão web. Por isso o caminho do callback é um só; o que muda é quem
 * trata o retorno:
 *
 * - Web: a própria página recebe `code` e `state` e conclui o login.
 * - App: a página web percebe, pelo sufixo no `state`, que o login partiu do
 *   aplicativo e o reabre pelo link do app (`br.gov.ma.inova.locomotiva://…`),
 *   entregando `code` e `state` sem consumi-los. O navegador de login fecha
 *   sozinho ao chegar nesse link.
 */

/** Precisa ser idêntico ao caminho do GOVBR_REDIRECT_URI cadastrado no gov.br. */
export const CAMINHO_CALLBACK_GOVBR = '/auth/govbr/callback';

/** Esquema do link do app. Lido do app.json para nunca divergir do build. */
const SCHEME_DO_APP: string = appJson.expo.scheme;

/** Espelho de `GovbrAuthRequest.SUFIXO_STATE_APP` na API. */
const SUFIXO_STATE_APP = '.app';

export type RetornoGovbr = {
    code: string | null;
    state: string | null;
    /** Código de erro do gov.br, ex.: `access_denied` quando a pessoa cancela. */
    error: string | null;
};

/** O login foi iniciado pelo aplicativo instalado (e não pela web)? */
export function stateVeioDoApp(state: string): boolean {
    return state.endsWith(SUFIXO_STATE_APP);
}

/** Link que abre o aplicativo. `caminho` sem barra inicial, ex.: `auth/govbr/callback`. */
export function linkDoApp(caminho = ''): string {
    return `${SCHEME_DO_APP}://${caminho.replace(/^\/+/, '')}`;
}

/**
 * Link do app para o callback do gov.br. Sem parâmetros serve como "endereço
 * de retorno" da sessão de login; com eles, é o que a página web usa para
 * devolver o resultado ao aplicativo.
 */
export function linkDoAppParaCallback(retorno?: RetornoGovbr): string {
    const base = linkDoApp(CAMINHO_CALLBACK_GOVBR);
    if (!retorno) return base;

    const pares = (Object.entries(retorno) as [string, string | null][])
        .filter(([, valor]) => valor !== null)
        .map(([chave, valor]) => `${chave}=${encodeURIComponent(valor as string)}`);
    return pares.length > 0 ? `${base}?${pares.join('&')}` : base;
}

/**
 * Interpreta uma URL de entrada. Devolve os parâmetros do retorno se ela for o
 * callback do gov.br (na web, `https://…/auth/govbr/callback?…`; no app, o link
 * do app), ou `null` para qualquer outra URL.
 */
export function lerRetornoGovbr(url: string | null | undefined): RetornoGovbr | null {
    if (!url) return null;

    // Sem depender de como cada plataforma interpreta um esquema próprio:
    // tira o esquema, separa a query, e compara só o caminho.
    const [semQuery, query = ''] = url.split('?', 2);
    const caminhoCompleto = semQuery
        .replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/*/, '')
        .replace(/\/+$/, '');
    if (!caminhoCompleto.endsWith(CAMINHO_CALLBACK_GOVBR.replace(/^\/+/, ''))) {
        return null;
    }

    const parametros = new Map<string, string>();
    for (const par of query.split('&')) {
        if (!par) continue;
        const [chave, ...resto] = par.split('=');
        try {
            parametros.set(decodeURIComponent(chave), decodeURIComponent(resto.join('=')));
        } catch {
            // Parâmetro malformado: ignora só ele.
        }
    }
    const parametro = (nome: string): string | null => parametros.get(nome) || null;

    return { code: parametro('code'), state: parametro('state'), error: parametro('error') };
}

// ────────────── URL de retorno vinda da sessão de login (nativo) ──────────────
//
// No Android, o link do app que fecha o navegador também chega como evento de
// URL, e `Linking.useURL()` o vê. No iOS a sessão de autenticação captura o
// link e o entrega só como resultado da promessa — então quem abriu a sessão
// precisa repassá-lo por aqui.

const ouvintes = new Set<(url: string) => void>();

/** Chamado por quem recebeu o link do app como resultado da sessão de login. */
export function entregarRetornoGovbr(url: string): void {
    ouvintes.forEach((ouvinte) => ouvinte(url));
}

/**
 * Última URL que pode ser um retorno do gov.br: a que abriu o app (ou a página,
 * na web), a de um evento de URL, ou a entregue pela sessão de login.
 */
export function useUrlRetornoGovbr(): string | null {
    // `getLinkingURL` devolve a URL de abertura já no primeiro render (na web,
    // a da página). Sem isso a navegação montaria por um instante antes da
    // tela de callback — e o React Navigation tentaria interpretar a URL.
    const [url, setUrl] = useState<string | null>(() => Linking.getLinkingURL() || null);

    useEffect(() => {
        const receber = (nova: string | null) => {
            if (!nova) return;
            if (__DEV__) console.log('[govbr] URL recebida:', nova);
            setUrl(nova);
        };

        // Dois canais de propósito: o do React Native (`url`) é o que o
        // development build e o expo-web-browser usam; o do expo-linking
        // (`onURLReceived`) é o do módulo nativo novo. Receber pelos dois é
        // inofensivo — a mesma URL só é tratada uma vez pela raiz do app.
        Linking.getInitialURL().then(receber).catch(() => { });
        const doReactNative = Linking.addEventListener('url', (evento) => receber(evento.url));
        ouvintes.add(receber);
        return () => {
            doReactNative.remove();
            ouvintes.delete(receber);
        };
    }, []);

    const doExpo = Linking.useLinkingURL();
    useEffect(() => {
        if (doExpo) setUrl(doExpo);
    }, [doExpo]);

    return url;
}
