import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { UpdatePrinterUseCase } from "@printing/application/use-cases/update-printer";

export const updatePrinterRoute = protectedRoute
    .route({ method: "PUT", path: "/printing/printers/{id}" })
    .input(UpdatePrinterUseCase.InputSchema)
    .output(UpdatePrinterUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const updatePrinterUseCase = container.getUpdatePrinterUseCase(context.user);
            return updatePrinterUseCase.execute(input);
        });
    });
