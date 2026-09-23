import { publicRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { CompleteGovbrRegistrationUseCase } from "src/modules/identity/application/use-cases/complete-govbr-registration";

/**
 * Segundo passo de quem é novo: recebe os dados que o gov.br não fornece e cria
 * a conta. Pública porque quem chama ainda não tem sessão — a autorização é o
 * ticket, e nome/e-mail/CPF vêm do servidor, não deste input.
 */
export const completeGovbrRegistrationRoute = publicRoute
    .route({ method: "POST", path: "/auth/govbr/register" })
    .input(CompleteGovbrRegistrationUseCase.InputSchema)
    .output(CompleteGovbrRegistrationUseCase.OutputSchema)
    .handler(async ({ input }) => {
        return orpcSafe(async () => {
            return container.getCompleteGovbrRegistrationUseCase().execute(input);
        })
    });
