import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { GetPrinterByIdUseCase } from "@printing/application/use-cases/get-printer-by-id";

export const getPrinterByIdRoute = protectedRoute
    .route({ method: "GET", path: "/printing/printers/{id}" })
    .input(GetPrinterByIdUseCase.InputSchema)
    .output(GetPrinterByIdUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const useCase = container.getGetPrinterByIdUseCase(context.user);
            return useCase.execute(input);
        });
    });
