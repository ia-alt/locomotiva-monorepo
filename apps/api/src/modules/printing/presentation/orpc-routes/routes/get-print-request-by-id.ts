import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { GetPrintRequestByIdUseCase } from "@printing/application/use-cases/get-print-request-by-id";

export const getPrintRequestByIdRoute = protectedRoute
    .route({ method: "GET", path: "/printing/print-requests/{printRequestId}" })
    .input(GetPrintRequestByIdUseCase.InputSchema)
    .output(GetPrintRequestByIdUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const useCase = container.getGetPrintRequestByIdUseCase(context.user);
            return useCase.execute(input);
        });
    });
