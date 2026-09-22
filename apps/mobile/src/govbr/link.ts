import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import appJson from '../../app.json';

/**
 * Idas e vindas entre o app e o gov.br nas três plataformas.
 *
 * O gov.br só devolve a pessoa para URLs HTTPS cadastradas na credencial, que
 * são as da versão web. Por isso os caminhos são um só; o que muda é quem
 * trata o retorno:
 *
 * - Web: a própria página recebe `code` e `state` e conclui o login.
 * - App: a página web percebe, pelo sufixo no `state`, que o login partiu do
 *   aplicativo e o reabre pelo link do app (`br.gov.ma.inova.locomotiva://…`),
 *   entregando `code` e `state` sem consumi-los. O navegador de login fecha
 *   sozinho ao chegar nesse link.
 *
 * A saída (logout federado) segue a mesma ideia — ver a seção no fim.
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

// ─────────────────────── saída (logout federado) ───────────────────────
//
// O roteiro do gov.br exige que a aplicação encerre a sessão lá ao sair. O
// gov.br só devolve para a URL cadastrada como "URL de Log Out" — a home da
// web — e a home, sozinha, não teria como saber que deve reabrir o app. Então
// o app abre a PÁGINA DE SAÍDA da web, que deixa uma marca no navegador, vai
// ao gov.br, e na volta a home vê a marca e reabre o app pelo link dele, o que
// fecha o navegador. Na web não há marca: sair vai ao gov.br e volta à home.

/** Página de saída da web. O app chega aqui com `?client=app`. */
export const CAMINHO_LOGOUT_GOVBR = '/auth/govbr/logout';

const CHAVE_SAIDA_PARA_APP = 'govbr:sair-para-app';

/** Uma volta pelo gov.br leva segundos; marca mais velha é resto de fluxo interrompido. */
const VALIDADE_SAIDA_MS = 2 * 60 * 1000;

/** Link do app que encerra o navegador de saída. */
export function linkDoAppParaLogout(): string {
    return linkDoApp(CAMINHO_LOGOUT_GOVBR);
}

export type SaidaGovbr = 'iniciar' | 'voltar-ao-app';

/**
 * Na web: esta é a página de saída (`iniciar`), ou a home aberta na volta do
 * gov.br com a marca do app (`voltar-ao-app`)? No nativo nunca é nenhum dos
 * dois — lá o link `…://auth/govbr/logout` só serve para fechar o navegador.
 *
 * Sem efeitos colaterais: a marca é consumida pela tela, não aqui.
 */
export function lerSaidaGovbr(url: string | null | undefined): SaidaGovbr | null {
    if (Platform.OS !== 'web' || !url) return null;

    try {
        const { pathname, searchParams } = new URL(url);
        if (pathname.replace(/\/+$/, '') === CAMINHO_LOGOUT_GOVBR && searchParams.get('client') === 'app') {
            return 'iniciar';
        }
    } catch {
        return null;
    }

    return temSaidaParaApp() ? 'voltar-ao-app' : null;
}

export function marcarSaidaParaApp(): void {
    try {
        window.sessionStorage.setItem(CHAVE_SAIDA_PARA_APP, String(Date.now()));
    } catch {
        // Navegador sem storage: a volta cai na home e a pessoa fecha o navegador.
    }
}

export function limparSaidaParaApp(): void {
    try {
        window.sessionStorage.removeItem(CHAVE_SAIDA_PARA_APP);
    } catch {
        // Nada a limpar.
    }
}

function temSaidaParaApp(): boolean {
    try {
        const marcadoEm = Number(window.sessionStorage.getItem(CHAVE_SAIDA_PARA_APP));
        return marcadoEm > 0 && Date.now() - marcadoEm < VALIDADE_SAIDA_MS;
    } catch {
        return false;
    }
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

// ──────────────── um retorno é tratado UMA vez, e só uma ────────────────
//
// O `code` do gov.br é de uso único: uma segunda troca sempre falha com
// "sessão de login expirada ou inválida". Duas situações levavam a isso:
//
// 1. Fechar o app pela lista de recentes e voltar por ali. O Android recria a
//    tela com o MESMO atalho que a abriu, que era o link de retorno do login
//    anterior — já consumido. Daí a proteção precisar sobreviver ao processo,
//    e não só à execução (`AsyncStorage`).
// 2. A mesma URL chegando por mais de um canal (evento do React Native,
//    `expo-linking`, resultado da sessão de login), às vezes com diferença de
//    escrita, depois da tela já ter concluído — o que remontava a tela.

const CHAVE_ULTIMO_RETORNO = 'govbr:ultimoRetornoTratado';

/** Retornos já entregues nesta execução. Cobre as entregas quase simultâneas. */
const tratadosNestaExecucao = new Set<string>();

/** Descarta o link que abriu o app, para ele não voltar numa recriação da tela. */
function descartarLinkDeEntrada(): void {
    try {
        // Só limpa o canal do expo-linking; o do React Native lê o atalho da
        // própria tela e o sistema o reentrega. Por isso a marca persistida
        // acima continua sendo necessária.
        Linking.clearInitialURL();
    } catch {
        // Plataforma sem suporte (web): não há atalho a limpar.
    }
}

/**
 * O retorno do gov.br a ser tratado agora, ou `null`. Devolve cada retorno uma
 * única vez, mesmo entre reaberturas do aplicativo.
 *
 * `concluir` some com a tela de retorno quando ela termina o trabalho.
 */
export function useRetornoGovbrPendente(url: string | null): [RetornoGovbr | null, () => void] {
    const [retorno, setRetorno] = useState<RetornoGovbr | null>(null);
    const concluir = useCallback(() => setRetorno(null), []);

    useEffect(() => {
        const candidato = lerRetornoGovbr(url);
        if (!candidato) return;

        // Sem `code` nem `state` não há nada a consumir — é só o gov.br
        // avisando de um erro (cancelamento, por exemplo). Mostra sempre.
        const chave = candidato.state ?? candidato.code;
        if (!chave) {
            descartarLinkDeEntrada();
            setRetorno(candidato);
            return;
        }

        if (tratadosNestaExecucao.has(chave)) return;
        tratadosNestaExecucao.add(chave);

        let cancelado = false;
        (async () => {
            let ultimo: string | null = null;
            try {
                ultimo = await AsyncStorage.getItem(CHAVE_ULTIMO_RETORNO);
            } catch {
                // Sem storage: segue e trata. No pior caso o servidor recusa.
            }
            if (cancelado) return;

            descartarLinkDeEntrada();
            if (ultimo === chave) return;

            try {
                await AsyncStorage.setItem(CHAVE_ULTIMO_RETORNO, chave);
            } catch {
                // Idem acima.
            }
            if (!cancelado) setRetorno(candidato);
        })();

        return () => { cancelado = true; };
    }, [url]);

    return [retorno, concluir];
}
