import { publicRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { StartGovbrLoginUseCase } from "src/modules/identity/application/use-cases/start-govbr-login";

/**
 * Devolve a URL do gov.br para o cliente redirecionar o usuário.
 *
 * Pública por natureza — quem chama ainda não tem sessão. Devolvemos a URL em
 * vez de responder 302 porque quem inicia é uma SPA via fetch, e um 302 seria
 * seguido pelo próprio fetch em vez de navegar a janela.
 */
export const startGovbrLoginRoute = publicRoute
    .route({ method: "POST", path: "/auth/govbr/start" })
    .input(StartGovbrLoginUseCase.InputSchema)
    .output(StartGovbrLoginUseCase.OutputSchema)
    .handler(async ({ input }) => {
        return orpcSafe(async () => {
            const startGovbrLoginUseCase = container.getStartGovbrLoginUseCase();
            return startGovbrLoginUseCase.execute(input);
        })
    });
