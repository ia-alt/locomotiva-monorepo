import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { GetRecentActivitiesUseCase } from "@coworking/application/use-cases/get-recent-activities";

export const getRecentActivitiesRoute = protectedRoute
    .route({ method: "GET", path: "/coworking/recent-activities" })
    .input(GetRecentActivitiesUseCase.InputSchema)
    .output(GetRecentActivitiesUseCase.OutputSchema)
    .handler(async ({ context }) => {
        return orpcSafe(async () => {
            const useCase = container.getRecentActivitiesUseCase(context.user);
            return useCase.execute();
        });
    });
