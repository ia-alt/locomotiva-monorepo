import { publicRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { env } from "@env";
import z from "zod";
import { GovbrAuthRequest } from "src/modules/identity/domain/entities";

/**
 * Para onde o cliente deve navegar para encerrar a sessão no gov.br. `null`
 * quando a integração está desligada ou sem configuração — o cliente então
 * faz só o logout local.
 *
 * O roteiro do gov.br (passo 12) trata o logout como implementação
 * obrigatória, partindo do front-end. Sem ele, "sair" é cosmético num
 * aparelho compartilhado: a sessão continua viva no gov.br e o próximo clique
 * em "Entrar com GOV.BR" entra sem pedir senha. Não há atalho: o gov.br
 * ignora `prompt=login` e `max_age` (testado em 03/09/2026).
 *
 * A URL de retorno precisa estar cadastrada na credencial (campo "URL de Log
 * Out"), senão o gov.br encerra a sessão mas para no portal dele. A cadastrada
 * hoje é a home da web.
 *
 * ⚠️ A comparação do gov.br é por string exata, inclusive a barra final.
 * Verificado em 22/09/2026 na homologação, três vezes cada:
 *
 *     …inova.ma.gov.br   → devolve para o nosso site   ✅
 *     …inova.ma.gov.br/  → vai para o portal do gov.br ❌
 *
 * Por isso o padrão usa `origin` puro (sem barra), que é o formato cadastrado.
 * Se um ambiente cadastrar com barra, defina `GOVBR_POST_LOGOUT_REDIRECT_URI`
 * com o valor exato em vez de mexer aqui.
 *
 * - `web` (padrão): a URL de logout do gov.br, que devolve para a home.
 * - `app`: a página de saída da web (`/auth/govbr/logout?client=app`). Ela
 *   deixa a marca "voltar ao aplicativo" no navegador antes de ir ao gov.br;
 *   sem isso a home, na volta, não teria como saber que deve reabrir o app.
 */
export const getGovbrLogoutUrlRoute = publicRoute
    .route({ method: "GET", path: "/auth/govbr/logout-url" })
    .input(z.object({ client: GovbrAuthRequest.ClientSchema.optional() }))
    .output(z.object({ url: z.string().nullable() }))
    .handler(async ({ input }) => {
        if (!container.isGovbrEnabled()) {
            return { url: null };
        }

        // `||`, não `??`: a variável vazia no .env (`GOVBR_POST_LOGOUT_REDIRECT_URI=`)
        // chega como string vazia e deve cair no padrão do mesmo jeito.
        // Sem barra no fim: ver o aviso acima.
        const destino = env.GOVBR_POST_LOGOUT_REDIRECT_URI
            || (env.GOVBR_REDIRECT_URI ? new URL(env.GOVBR_REDIRECT_URI).origin : null);
        if (!destino) {
            return { url: null };
        }

        if (input.client === "app") {
            return { url: `${new URL(destino).origin}/auth/govbr/logout?client=app` };
        }

        try {
            return { url: container.getGovbrOidcService().buildLogoutUrl(destino) };
        } catch {
            // Credencial não configurada neste ambiente: logout local basta.
            return { url: null };
        }
    });
