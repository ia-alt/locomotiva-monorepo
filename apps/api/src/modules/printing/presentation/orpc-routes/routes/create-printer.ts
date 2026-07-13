import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { CreatePrinterUseCase } from "@printing/application/use-cases/create-printer";

export const createPrinterRoute = protectedRoute
    .route({ method: "POST", path: "/printing/printers" })
    .input(CreatePrinterUseCase.InputSchema)
    .output(CreatePrinterUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const createPrinterUseCase = container.getCreatePrinterUseCase(context.user);
            return createPrinterUseCase.execute(input);
        });
    });
