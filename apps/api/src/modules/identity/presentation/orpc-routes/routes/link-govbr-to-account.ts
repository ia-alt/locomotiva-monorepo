import { publicRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { LinkGovbrToAccountUseCase } from "src/modules/identity/application/use-cases/link-govbr-to-account";

/**
 * Segundo passo de quem já tinha conta com senha: prova a posse e vincula.
 * Pública porque quem chama ainda não tem sessão — a autorização é o ticket.
 */
export const linkGovbrToAccountRoute = publicRoute
    .route({ method: "POST", path: "/auth/govbr/link" })
    .input(LinkGovbrToAccountUseCase.InputSchema)
    .output(LinkGovbrToAccountUseCase.OutputSchema)
    .handler(async ({ input }) => {
        return orpcSafe(async () => {
            return container.getLinkGovbrToAccountUseCase().execute(input);
        })
    });
