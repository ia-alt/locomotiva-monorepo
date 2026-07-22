import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { AllocatePrinterUseCase } from "@printing/application/use-cases/allocate-printer";

export const allocatePrinterRoute = protectedRoute
    .route({ method: "POST", path: "/printing/print-requests/{printRequestId}/allocate-printer" })
    .input(AllocatePrinterUseCase.InputSchema)
    .output(AllocatePrinterUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const useCase = container.getAllocatePrinterUseCase(context.user);
            return useCase.execute(input);
        });
    });
