import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import { RevokeApiKeyUseCase } from "src/modules/identity/application/use-cases/revoke-api-key";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";

export const revokeApiKeyRoute = protectedRoute
    .route({ method: "DELETE", path: "/api-keys/{id}" })
    .input(RevokeApiKeyUseCase.InputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const useCase = container.getRevokeApiKeyUseCase(context.user);
            return useCase.execute(input);
        });
    });
