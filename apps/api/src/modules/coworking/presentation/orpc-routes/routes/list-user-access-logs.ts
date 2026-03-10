import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { ListUserAccessLogsUseCase } from "@coworking/application/use-cases/list-user-access-logs";

export const listUserAccessLogsRoute = protectedRoute
    .route({ method: "GET", path: "/coworking/access-logs/mine" })
    .input(ListUserAccessLogsUseCase.InputSchema)
    .output(ListUserAccessLogsUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const listUserAccessLogsUseCase = container.getListUserAccessLogsUseCase(context.user);
            return listUserAccessLogsUseCase.execute(input);
        })
    });
