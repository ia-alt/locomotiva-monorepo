import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { GetAccessStatsUseCase } from "@coworking/application/use-cases/get-access-stats";

export const getAccessStatsRoute = protectedRoute
    .route({ method: "GET", path: "/coworking/access-stats" })
    .input(GetAccessStatsUseCase.InputSchema)
    .output(GetAccessStatsUseCase.OutputSchema)
    .handler(async ({ context }) => {
        return orpcSafe(async () => {
            const useCase = container.getAccessStatsUseCase(context.user);
            return useCase.execute();
        });
    });
