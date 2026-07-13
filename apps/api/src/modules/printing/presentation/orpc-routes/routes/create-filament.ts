import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { CreateFilamentUseCase } from "@printing/application/use-cases/create-filament";

export const createFilamentRoute = protectedRoute
    .route({ method: "POST", path: "/printing/filaments" })
    .input(CreateFilamentUseCase.InputSchema)
    .output(CreateFilamentUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const useCase = container.getCreateFilamentUseCase(context.user);
            return useCase.execute(input);
        });
    });
