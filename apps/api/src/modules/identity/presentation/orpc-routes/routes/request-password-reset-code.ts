import { publicRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { RequestPasswordResetCodeUseCase } from "src/modules/identity/application/use-cases/request-password-reset-code";

export const requestPasswordResetCodeRoute = publicRoute
    .route({ method: "POST", path: "/auth/request-password-reset-code" })
    .input(RequestPasswordResetCodeUseCase.InputSchema)
    .output(RequestPasswordResetCodeUseCase.OutputSchema)
    .handler(async ({ input }) => {
        return orpcSafe(async () => {
            const useCase = container.getRequestPasswordResetCodeUseCase();
            return useCase.execute(input);
        });
    });
