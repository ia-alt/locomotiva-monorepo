import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { CountActiveAccessLogsUseCase } from "@coworking/application/use-cases/count-active-access-logs";

export const countActiveAccessLogsRoute = protectedRoute
    .route({ method: "GET", path: "/coworking/access-logs/count" })
    .input(CountActiveAccessLogsUseCase.InputSchema)
    .output(CountActiveAccessLogsUseCase.OutputSchema)
    .handler(async ({ context }) => {
        return orpcSafe(async () => {
            const countActiveAccessLogsUseCase = container.getCountActiveAccessLogsUseCase(context.user);
            return countActiveAccessLogsUseCase.execute();
        })
    });
