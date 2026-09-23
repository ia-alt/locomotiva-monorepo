import AsyncStorage from '@react-native-async-storage/async-storage';
import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import { RouterClientType } from '../../../api/src/modules/_core/presentation/orpc-server/router';

/**
 * Sessão persistente ("continuar conectado").
 *
 * O par fica no AsyncStorage: o `token` (JWT curto) vai em toda request; o
 * `refreshToken` (longo, revogável no servidor) só sai daqui para renovar ou
 * encerrar a sessão. Quando o token de acesso expira, o interceptador do
 * `link.ts` chama `renovarSessao()` e repete a chamada — a pessoa não percebe.
 */

const CHAVES_SESSAO = ['token', 'refreshToken', 'loginMethod'] as const;

/**
 * Client "pelado", sem Bearer e sem o retry do link principal — usado só para
 * renovar a sessão. Se usasse o link principal, um refresh que respondesse 401
 * dispararia outro refresh, em loop.
 */
const clientSemAuth: RouterClientType = createORPCClient(
    new RPCLink({ url: process.env.EXPO_PUBLIC_API_URL! })
);

/**
 * Como a pessoa entrou. Decide o que o "sair" faz: quem entrou pelo gov.br
 * também precisa encerrar a sessão lá (o roteiro do gov.br exige); quem entrou
 * por senha não tem sessão gov.br para encerrar.
 */
export type MetodoDeLogin = 'password' | 'govbr';

export async function salvarSessao(token: string, refreshToken: string, metodo?: MetodoDeLogin): Promise<void> {
    // `metodo` só vem no login. A renovação não o passa, e ele fica como está.
    await AsyncStorage.multiSet([
        ['token', token],
        ['refreshToken', refreshToken],
        ...(metodo ? [['loginMethod', metodo] as [string, string]] : []),
    ]);
}

export async function lerMetodoDeLogin(): Promise<MetodoDeLogin | null> {
    const valor = await AsyncStorage.getItem('loginMethod');
    return valor === 'password' || valor === 'govbr' ? valor : null;
}

export async function limparSessao(): Promise<void> {
    await AsyncStorage.multiRemove([...CHAVES_SESSAO]);
}

let renovacaoEmAndamento: Promise<string | null> | null = null;

/**
 * Troca o refresh token por um par novo. Devolve o novo token de acesso, ou
 * `null` quando a sessão realmente acabou (expirou, foi revogada ou nunca
 * existiu) — nesse caso o storage já sai limpo e a pessoa volta ao login.
 *
 * Single-flight: várias requests recebendo 401 ao mesmo tempo (tela com N
 * queries) compartilham UMA renovação. Sem isso, a rotação faria as demais
 * falharem — cada refresh token só pode ser usado uma vez.
 */
export function renovarSessao(): Promise<string | null> {
    if (!renovacaoEmAndamento) {
        renovacaoEmAndamento = (async () => {
            try {
                const refreshToken = await AsyncStorage.getItem('refreshToken');
                if (!refreshToken) return null;

                const sessao = await clientSemAuth.identy.refreshSession({ refreshToken });
                await salvarSessao(sessao.token, sessao.refreshToken);
                return sessao.token;
            } catch {
                // Refresh inválido: a sessão acabou de verdade. Limpar aqui
                // evita insistir num token morto a cada request.
                await limparSessao();
                return null;
            } finally {
                renovacaoEmAndamento = null;
            }
        })();
    }
    return renovacaoEmAndamento;
}
