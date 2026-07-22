import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { UploadFileUseCase } from "@storage/application/use-cases/upload-file";

export const uploadFileRoute = protectedRoute
    .route({ method: "POST", path: "/storage/files" })
    .input(UploadFileUseCase.InputSchema)
    .output(UploadFileUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const uploadFileUseCase = container.getUploadFileUseCase(context.user);
            return uploadFileUseCase.execute(input);
        });
    });
