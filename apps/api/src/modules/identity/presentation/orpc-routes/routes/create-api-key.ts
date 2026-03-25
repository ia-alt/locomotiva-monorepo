import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { CreateApiKeyUseCase } from "src/modules/identity/application/use-cases/create-api-key";

export const createApiKeyRoute = protectedRoute
    .route({ method: "POST", path: "/admin/api-keys/create" })
    .input(CreateApiKeyUseCase.InputSchema)
    .output(CreateApiKeyUseCase.OutputSchema)
    .handler(async ({ context, input }) => {
        return orpcSafe(async () => {
            const createApiKeyUseCase = container.getCreateApiKeyUseCase(context.user);
            return createApiKeyUseCase.execute(input);
        })
    });
