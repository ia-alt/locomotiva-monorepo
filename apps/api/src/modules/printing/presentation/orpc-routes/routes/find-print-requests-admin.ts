import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { FindPrintRequestsAdminUseCase } from "@printing/application/use-cases/find-print-requests-admin";

export const findPrintRequestsAdminRoute = protectedRoute
    .route({ method: "POST", path: "/printing/print-requests/search" })
    .input(FindPrintRequestsAdminUseCase.InputSchema)
    .output(FindPrintRequestsAdminUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const useCase = container.getFindPrintRequestsAdminUseCase(context.user);
            return useCase.execute(input);
        });
    });
