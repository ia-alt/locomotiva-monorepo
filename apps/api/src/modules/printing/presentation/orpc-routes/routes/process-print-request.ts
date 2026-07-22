import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { ProcessPrintRequestUseCase } from "@printing/application/use-cases/process-print-request";

export const processPrintRequestRoute = protectedRoute
    .route({ method: "POST", path: "/printing/print-requests/{printRequestId}/process" })
    .input(ProcessPrintRequestUseCase.InputSchema)
    .output(ProcessPrintRequestUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const useCase = container.getProcessPrintRequestUseCase(context.user);
            return useCase.execute(input);
        });
    });
