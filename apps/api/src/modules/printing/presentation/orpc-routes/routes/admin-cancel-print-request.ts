import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { AdminCancelPrintRequestUseCase } from "@printing/application/use-cases/admin-cancel-print-request";

export const adminCancelPrintRequestRoute = protectedRoute
    .route({ method: "POST", path: "/printing/print-requests/{printRequestId}/admin-cancel" })
    .input(AdminCancelPrintRequestUseCase.InputSchema)
    .output(AdminCancelPrintRequestUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const useCase = container.getAdminCancelPrintRequestUseCase(context.user);
            return useCase.execute(input);
        });
    });
