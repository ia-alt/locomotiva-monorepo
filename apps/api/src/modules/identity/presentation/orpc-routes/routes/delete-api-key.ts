import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { DeleteApiKeyUseCase } from "src/modules/identity/application/use-cases/delete-api-key";

export const deleteApiKeyRoute = protectedRoute
    .route({ method: "POST", path: "/admin/api-keys/delete" })
    .input(DeleteApiKeyUseCase.InputSchema)
    .output(DeleteApiKeyUseCase.OutputSchema)
    .handler(async ({ context, input }) => {
        return orpcSafe(async () => {
            const deleteApiKeyUseCase = container.getDeleteApiKeyUseCase(context.user);
            return deleteApiKeyUseCase.execute(input);
        })
    });
