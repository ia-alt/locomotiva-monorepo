import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { AdminPerformCheckinUseCase } from "@coworking/application/use-cases/admin-perform-checkin";

export const adminPerformCheckinRoute = protectedRoute
    .route({ method: "POST", path: "/coworking/admin/checkin" })
    .input(AdminPerformCheckinUseCase.InputSchema)
    .output(AdminPerformCheckinUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const adminPerformCheckinUseCase = container.getAdminPerformCheckinUseCase(context.user);
            return adminPerformCheckinUseCase.execute(input);
        })
    });
