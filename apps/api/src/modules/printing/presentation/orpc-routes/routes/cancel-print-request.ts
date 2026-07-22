import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { CancelPrintRequestUseCase } from "@printing/application/use-cases/cancel-print-request";

export const cancelPrintRequestRoute = protectedRoute
    .route({ method: "POST", path: "/printing/print-requests/{printRequestId}/cancel" })
    .input(CancelPrintRequestUseCase.InputSchema)
    .output(CancelPrintRequestUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const useCase = container.getCancelPrintRequestUseCase(context.user);
            return useCase.execute(input);
        });
    });
