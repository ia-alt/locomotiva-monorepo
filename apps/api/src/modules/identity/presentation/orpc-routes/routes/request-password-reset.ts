import { publicRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { RequestPasswordResetUseCase } from "src/modules/identity/application/use-cases/request-password-reset";

export const requestPasswordResetRoute = publicRoute
    .route({ method: "POST", path: "/auth/request-password-reset" })
    .input(RequestPasswordResetUseCase.InputSchema)
    .output(RequestPasswordResetUseCase.OutputSchema)
    .handler(async ({ input }) => {
        return orpcSafe(async () => {
            const requestPasswordResetUseCase = container.getRequestPasswordResetUseCase();
            return requestPasswordResetUseCase.execute(input);
        })
    });
