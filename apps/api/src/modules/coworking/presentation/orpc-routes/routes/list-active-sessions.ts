import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { ListActiveSessionsUseCase } from "@coworking/application/use-cases/list-active-sessions";

export const listActiveSessionsRoute = protectedRoute
    .route({ method: "GET", path: "/coworking/active-sessions" })
    .output(ListActiveSessionsUseCase.OutputSchema)
    .handler(async ({ context }) => {
        return orpcSafe(async () => {
            const useCase = container.getListActiveSessionsUseCase(context.user);
            return useCase.execute();
        });
    });
