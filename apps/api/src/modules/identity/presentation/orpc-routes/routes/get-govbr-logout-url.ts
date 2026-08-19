import { publicRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { env } from "@env";
import z from "zod";

/**
 * URL do logout federado do gov.br. `null` quando a integração está desligada
 * ou sem configuração — o cliente então faz só o logout local.
 *
 * Sem o logout federado, "sair" é cosmético num computador compartilhado: a
 * sessão continua viva no gov.br e o próximo clique em "Entrar com GOV.BR"
 * entra sem pedir senha. Redirecionar para este endereço encerra as duas
 * sessões de uma vez.
 *
 * A URL de retorno precisa estar cadastrada na credencial (campo "URL de Log
 * Out"), senão o gov.br encerra a sessão mas para numa página de erro.
 */
export const getGovbrLogoutUrlRoute = publicRoute
    .route({ method: "GET", path: "/auth/govbr/logout-url" })
    .input(z.object({}))
    .output(z.object({ url: z.string().nullable() }))
    .handler(async () => {
        if (!container.isGovbrEnabled()) {
            return { url: null };
        }

        const destino = env.GOVBR_POST_LOGOUT_REDIRECT_URI
            ?? (env.GOVBR_REDIRECT_URI ? `${new URL(env.GOVBR_REDIRECT_URI).origin}/` : null);
        if (!destino) {
            return { url: null };
        }

        try {
            return { url: container.getGovbrOidcService().buildLogoutUrl(destino) };
        } catch {
            // Credencial não configurada neste ambiente: logout local basta.
            return { url: null };
        }
    });
