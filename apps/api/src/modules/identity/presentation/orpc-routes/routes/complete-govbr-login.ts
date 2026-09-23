import { publicRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { CompleteGovbrLoginUseCase } from "src/modules/identity/application/use-cases/complete-govbr-login";

/**
 * Recebe do cliente o `code` e o `state` que vieram na URL de retorno do gov.br
 * e devolve a sessão da aplicação.
 *
 * POST, e não GET, porque a `redirect_uri` cadastrada aponta para o app — quem
 * navega até lá é o navegador do usuário, e é a página do app que repassa os
 * valores para cá. Assim a troca do código (que usa o `client_secret`) acontece
 * inteira no servidor.
 *
 * Pública porque é justamente ela que cria a sessão. A autorização vem do
 * `code` do gov.br e do `state` que só nós emitimos.
 */
export const completeGovbrLoginRoute = publicRoute
    .route({ method: "POST", path: "/auth/govbr/callback" })
    .input(CompleteGovbrLoginUseCase.InputSchema)
    .output(CompleteGovbrLoginUseCase.OutputSchema)
    .handler(async ({ input }) => {
        return orpcSafe(async () => {
            const completeGovbrLoginUseCase = container.getCompleteGovbrLoginUseCase();
            return completeGovbrLoginUseCase.execute(input);
        })
    });
