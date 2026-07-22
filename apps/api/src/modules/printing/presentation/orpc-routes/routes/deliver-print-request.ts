import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { DeliverPrintRequestUseCase } from "@printing/application/use-cases/deliver-print-request";

export const deliverPrintRequestRoute = protectedRoute
    .route({ method: "POST", path: "/printing/print-requests/{printRequestId}/deliver" })
    .input(DeliverPrintRequestUseCase.InputSchema)
    .output(DeliverPrintRequestUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const useCase = container.getDeliverPrintRequestUseCase(context.user);
            return useCase.execute(input);
        });
    });
