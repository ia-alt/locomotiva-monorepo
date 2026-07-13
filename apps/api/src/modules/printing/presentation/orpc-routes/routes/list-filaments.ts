import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { ListFilamentsUseCase } from "@printing/application/use-cases/list-filaments";

export const listFilamentsRoute = protectedRoute
    .route({ method: "GET", path: "/printing/filaments" })
    .input(ListFilamentsUseCase.InputSchema)
    .output(ListFilamentsUseCase.OutputSchema)
    .handler(async ({ context }) => {
        return orpcSafe(async () => {
            const useCase = container.getListFilamentsUseCase(context.user);
            return useCase.execute();
        });
    });
