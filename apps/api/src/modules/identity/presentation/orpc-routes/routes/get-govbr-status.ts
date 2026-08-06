import { publicRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import z from "zod";

/**
 * Diz aos clientes se o botão "Entrar com gov.br" deve aparecer.
 *
 * A fonte da verdade é a API, e não uma variável em cada cliente: assim uma
 * única mudança em `GOVBR_ENABLED` no servidor desliga o botão em todos os
 * aplicativos, sem redeploy de nenhum deles.
 *
 * É afirmação de disponibilidade, não de autorização — as quatro rotas do fluxo
 * verificam a mesma chave por conta própria.
 */
export const getGovbrStatusRoute = publicRoute
    .route({ method: "GET", path: "/auth/govbr/status" })
    .input(z.object({}))
    .output(z.object({ enabled: z.boolean() }))
    .handler(async () => {
        return { enabled: container.isGovbrEnabled() };
    });
