import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { ListAccessLogsByDayUseCase } from "@coworking/application/use-cases/list-access-logs-by-day";

export const listAccessLogsByDayRoute = protectedRoute
    .route({ method: "GET", path: "/coworking/access-logs/by-day" })
    .input(ListAccessLogsByDayUseCase.InputSchema)
    .output(ListAccessLogsByDayUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const listAccessLogsByDayUseCase = container.getListAccessLogsByDayUseCase(context.user);
            return listAccessLogsByDayUseCase.execute(input);
        })
    });
