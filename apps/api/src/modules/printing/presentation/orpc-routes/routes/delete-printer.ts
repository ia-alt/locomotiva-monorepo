import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { DeletePrinterUseCase } from "@printing/application/use-cases/delete-printer";

export const deletePrinterRoute = protectedRoute
    .route({ method: "DELETE", path: "/printing/printers/{id}" })
    .input(DeletePrinterUseCase.InputSchema)
    .output(DeletePrinterUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const deletePrinterUseCase = container.getDeletePrinterUseCase(context.user);
            return deletePrinterUseCase.execute(input);
        });
    });
