import { publicRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { RefreshSessionUseCase } from "src/modules/identity/application/use-cases/refresh-session";

export const refreshSessionRoute = publicRoute
    .route({ method: "POST", path: "/auth/refresh" })
    .input(RefreshSessionUseCase.InputSchema)
    .output(RefreshSessionUseCase.OutputSchema)
    .handler(async ({ input }) => {
        return orpcSafe(async () => {
            const refreshSessionUseCase = container.getRefreshSessionUseCase();
            return refreshSessionUseCase.execute(input);
        })
    });
