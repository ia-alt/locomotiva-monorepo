import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { DeleteFilamentUseCase } from "@printing/application/use-cases/delete-filament";

export const deleteFilamentRoute = protectedRoute
    .route({ method: "DELETE", path: "/printing/filaments/{id}" })
    .input(DeleteFilamentUseCase.InputSchema)
    .output(DeleteFilamentUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const useCase = container.getDeleteFilamentUseCase(context.user);
            return useCase.execute(input);
        });
    });
