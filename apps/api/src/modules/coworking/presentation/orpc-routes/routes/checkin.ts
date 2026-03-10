import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { PerformCheckinUseCase } from "@coworking/application/use-cases/perform-checkin";

export const performCheckinRoute = protectedRoute
    .route({ method: "POST", path: "/coworking/checkin" })
    .input(PerformCheckinUseCase.InputSchema)
    .output(PerformCheckinUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const performCheckinUseCase = container.getPerformCheckinUseCase(context.user);
            return performCheckinUseCase.execute(input);
        })
    });
