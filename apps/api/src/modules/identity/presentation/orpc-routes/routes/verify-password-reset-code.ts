import { publicRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { VerifyPasswordResetCodeUseCase } from "src/modules/identity/application/use-cases/verify-password-reset-code";

export const verifyPasswordResetCodeRoute = publicRoute
    .route({ method: "POST", path: "/auth/verify-password-reset-code" })
    .input(VerifyPasswordResetCodeUseCase.InputSchema)
    .output(VerifyPasswordResetCodeUseCase.OutputSchema)
    .handler(async ({ input }) => {
        return orpcSafe(async () => {
            const useCase = container.getVerifyPasswordResetCodeUseCase();
            return useCase.execute(input);
        });
    });
