import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { CreatePrintFileDownloadUrlUseCase } from "@printing/application/use-cases/create-print-file-download-url";

export const createPrintFileDownloadUrlRoute = protectedRoute
    .route({ method: "POST", path: "/printing/print-requests/{printRequestId}/file-download-url" })
    .input(CreatePrintFileDownloadUrlUseCase.InputSchema)
    .output(CreatePrintFileDownloadUrlUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const useCase = container.getCreatePrintFileDownloadUrlUseCase(context.user);
            return useCase.execute(input);
        });
    });
