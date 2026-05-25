import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { GenerateAndRenderMonthReportUseCase } from "@report/application/use-cases/generate-and-render-month-report";

export const generateAndRenderMonthReportRoute = protectedRoute
    .route({ method: "GET", path: "/report/month/pdf" })
    .input(GenerateAndRenderMonthReportUseCase.InputSchema)
    .output(GenerateAndRenderMonthReportUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const useCase = container.getGenerateAndRenderMonthReportUseCase(context.user);
            return useCase.execute(input);
        });
    });
