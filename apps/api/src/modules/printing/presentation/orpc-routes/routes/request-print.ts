import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { RequestPrintUseCase } from "@printing/application/use-cases/request-print";

export const requestPrintRoute = protectedRoute
    .route({ method: "POST", path: "/printing/print-requests" })
    .input(RequestPrintUseCase.InputSchema)
    .output(RequestPrintUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const requestPrintUseCase = container.getRequestPrintUseCase(context.user);
            return requestPrintUseCase.execute(input);
        });
    });
