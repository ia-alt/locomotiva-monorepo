import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { CompletePrintRequestUseCase } from "@printing/application/use-cases/complete-print-request";

export const completePrintRequestRoute = protectedRoute
    .route({ method: "POST", path: "/printing/print-requests/{printRequestId}/complete" })
    .input(CompletePrintRequestUseCase.InputSchema)
    .output(CompletePrintRequestUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const useCase = container.getCompletePrintRequestUseCase(context.user);
            return useCase.execute(input);
        });
    });
