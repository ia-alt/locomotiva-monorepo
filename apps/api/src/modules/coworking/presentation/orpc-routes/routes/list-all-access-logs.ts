import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { ListAllAccessLogsUseCase } from "@coworking/application/use-cases/list-all-access-logs";

export const listAllAccessLogsRoute = protectedRoute
    .route({ method: "GET", path: "/coworking/access-logs" })
    .input(ListAllAccessLogsUseCase.InputSchema)
    .output(ListAllAccessLogsUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const listAllAccessLogsUseCase = container.getListAllAccessLogsUseCase(context.user);
            return listAllAccessLogsUseCase.execute(input);
        })
    });
