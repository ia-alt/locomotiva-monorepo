import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { StartPrintProductionUseCase } from "@printing/application/use-cases/start-print-production";

export const startPrintProductionRoute = protectedRoute
    .route({ method: "POST", path: "/printing/print-requests/{printRequestId}/start-production" })
    .input(StartPrintProductionUseCase.InputSchema)
    .output(StartPrintProductionUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const useCase = container.getStartPrintProductionUseCase(context.user);
            return useCase.execute(input);
        });
    });
