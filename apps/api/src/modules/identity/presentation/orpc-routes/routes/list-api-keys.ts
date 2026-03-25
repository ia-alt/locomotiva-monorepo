import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { ListApiKeysUseCase } from "src/modules/identity/application/use-cases/list-api-keys";

export const listApiKeysRoute = protectedRoute
    .route({ method: "GET", path: "/admin/api-keys/list" })
    .input(ListApiKeysUseCase.InputSchema)
    .output(ListApiKeysUseCase.OutputSchema)
    .handler(async ({ context, input }) => {
        return orpcSafe(async () => {
            const listApiKeysUseCase = container.getListApiKeysUseCase(context.user);
            return listApiKeysUseCase.execute(input);
        })
    });
