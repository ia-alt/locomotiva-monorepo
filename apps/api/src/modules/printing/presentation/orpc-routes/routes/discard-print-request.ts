import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { DiscardPrintRequestUseCase } from "@printing/application/use-cases/discard-print-request";

export const discardPrintRequestRoute = protectedRoute
    .route({ method: "POST", path: "/printing/print-requests/{printRequestId}/discard" })
    .input(DiscardPrintRequestUseCase.InputSchema)
    .output(DiscardPrintRequestUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const useCase = container.getDiscardPrintRequestUseCase(context.user);
            return useCase.execute(input);
        });
    });
