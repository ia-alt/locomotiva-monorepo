import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { GenerateMonthReportUseCase } from "@report/application/use-cases/generate-month-report";

export const generateMonthReportRoute = protectedRoute
    .route({ method: "GET", path: "/report/month" })
    .input(GenerateMonthReportUseCase.InputSchema)
    .output(GenerateMonthReportUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const useCase = container.getGenerateMonthReportUseCase(context.user);
            return useCase.execute(input);
        });
    });
