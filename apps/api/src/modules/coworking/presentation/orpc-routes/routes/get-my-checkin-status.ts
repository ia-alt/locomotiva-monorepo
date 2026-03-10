import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { GetMyCheckinStatusUseCase } from "@coworking/application/use-cases/get-my-checkin-status";

export const getMyCheckinStatusRoute = protectedRoute
    .route({ method: "GET", path: "/coworking/access-logs/mine/status" })
    .input(GetMyCheckinStatusUseCase.InputSchema)
    .output(GetMyCheckinStatusUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const getMyCheckinStatusUseCase = container.getGetMyCheckinStatusUseCase(context.user);
            return getMyCheckinStatusUseCase.execute(input);
        })
    });
