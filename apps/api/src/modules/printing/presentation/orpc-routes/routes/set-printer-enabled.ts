import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { SetPrinterEnabledUseCase } from "@printing/application/use-cases/set-printer-enabled";

export const setPrinterEnabledRoute = protectedRoute
    .route({ method: "PUT", path: "/printing/printers/{id}/enabled" })
    .input(SetPrinterEnabledUseCase.InputSchema)
    .output(SetPrinterEnabledUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const useCase = container.getSetPrinterEnabledUseCase(context.user);
            return useCase.execute(input);
        });
    });
