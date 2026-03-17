import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { GetYearlyReportUseCase } from "@coworking/application/use-cases/get-yearly-report";

export const getYearlyReportRoute = protectedRoute
    .route({ method: "GET", path: "/coworking/yearly-report" })
    .input(GetYearlyReportUseCase.InputSchema)
    .output(GetYearlyReportUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const useCase = container.getYearlyReportUseCase(context.user);
            return useCase.execute(input);
        });
    });
