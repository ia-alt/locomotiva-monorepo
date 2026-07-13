import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { FindMyPrintRequestsUseCase } from "@printing/application/use-cases/find-my-print-requests";

export const findMyPrintRequestsRoute = protectedRoute
    .route({ method: "POST", path: "/printing/print-requests/mine/search" })
    .input(FindMyPrintRequestsUseCase.InputSchema)
    .output(FindMyPrintRequestsUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const useCase = container.getFindMyPrintRequestsUseCase(context.user);
            return useCase.execute(input);
        });
    });
