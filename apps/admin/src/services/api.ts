import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import type { router } from '@backend/_core/presentation/orpc-server/router';
import type { RouterClient } from '@orpc/server';

export type AppRouter = typeof router;

/**
 * Sessão persistente ("continuar conectado").
 *
 * O `token` (JWT curto) vai em toda request; o `refreshToken` (longo,
 * revogável no servidor) só sai daqui para renovar ou encerrar a sessão.
 * Quando o token de acesso expira, o interceptador abaixo renova e repete a
 * chamada — a pessoa não percebe.
 */

export function salvarSessao(token: string, refreshToken: string): void {
  localStorage.setItem('token', token);
  localStorage.setItem('refreshToken', refreshToken);
}

export function limparSessao(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
}

/**
 * Revoga a sessão no servidor e limpa o storage. Sem a revogação o "sair"
 * seria só cosmético: o refresh token continuaria válido no banco até expirar.
 */
export async function encerrarSessao(): Promise<void> {
  const refreshToken = localStorage.getItem('refreshToken');
  limparSessao();
  if (!refreshToken) return;
  try {
    await clientSemAuth.identy.logout({ refreshToken });
  } catch {
    // Sem rede, sai mesmo assim: a sessão local morreu e a do servidor expira.
  }
}

/**
 * Client "pelado", sem Bearer e sem o retry do link principal — usado só para
 * renovar/encerrar a sessão. Se usasse o link principal, um refresh que
 * respondesse 401 dispararia outro refresh, em loop.
 */
const clientSemAuth: RouterClient<typeof router> = createORPCClient(
  new RPCLink({ url: import.meta.env.VITE_API_URL })
);

let renovacaoEmAndamento: Promise<string | null> | null = null;

/**
 * Troca o refresh token por um par novo. Single-flight: várias requests
 * recebendo 401 ao mesmo tempo compartilham UMA renovação — cada refresh token
 * só pode ser usado uma vez (rotação).
 */
function renovarSessao(): Promise<string | null> {
  if (!renovacaoEmAndamento) {
    renovacaoEmAndamento = (async () => {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) return null;

        const sessao = await clientSemAuth.identy.refreshSession({ refreshToken });
        salvarSessao(sessao.token, sessao.refreshToken);
        return sessao.token;
      } catch {
        // Refresh inválido: a sessão acabou de verdade.
        limparSessao();
        return null;
      } finally {
        renovacaoEmAndamento = null;
      }
    })();
  }
  return renovacaoEmAndamento;
}

/**
 * 401 = token de acesso (curto) provavelmente expirou: renova pelo refresh
 * token e repete a chamada UMA vez. Se a renovação falhar, devolve o 401
 * original — o ProtectedRoute derruba a sessão e manda pro login.
 */
async function fetchComRenovacao(request: Request): Promise<Response> {
  const copia = request.clone();
  const resposta = await fetch(request);
  if (resposta.status !== 401) return resposta;

  const novoToken = await renovarSessao();
  if (!novoToken) return resposta;

  const headers = new Headers(copia.headers);
  headers.set('authorization', `Bearer ${novoToken}`);
  return fetch(new Request(copia, { headers }));
}

export const orpc: RouterClient<typeof router> = createORPCClient(
  new RPCLink({
    url: import.meta.env.VITE_API_URL,
    headers: () => {
      const token = localStorage.getItem('token');
      return {
        ...(token && { Authorization: `Bearer ${token}` }),
      };
    },
    fetch: fetchComRenovacao,
  })
);
