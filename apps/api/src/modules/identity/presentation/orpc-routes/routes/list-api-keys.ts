import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import { ListApiKeysUseCase } from "src/modules/identity/application/use-cases/list-api-keys";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";

export const listApiKeysRoute = protectedRoute
    .route({ method: "GET", path: "/api-keys" })
    .output(ListApiKeysUseCase.OutputSchema)
    .handler(async ({ context }) => {
        return orpcSafe(async () => {
            const useCase = container.getListApiKeysUseCase(context.user);
            return useCase.execute();
        });
    });
