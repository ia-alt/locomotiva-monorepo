import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import { CreateApiKeyUseCase } from "src/modules/identity/application/use-cases/create-api-key";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";

export const createApiKeyRoute = protectedRoute
    .route({ method: "POST", path: "/api-keys" })
    .input(CreateApiKeyUseCase.InputSchema)
    .output(CreateApiKeyUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const useCase = container.getCreateApiKeyUseCase(context.user);
            return useCase.execute(input);
        });
    });
