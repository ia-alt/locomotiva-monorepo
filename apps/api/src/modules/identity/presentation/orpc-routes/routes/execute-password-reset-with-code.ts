import { publicRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { ExecutePasswordResetWithCodeUseCase } from "src/modules/identity/application/use-cases/execute-password-reset-with-code";

export const executePasswordResetWithCodeRoute = publicRoute
    .route({ method: "POST", path: "/auth/execute-password-reset-with-code" })
    .input(ExecutePasswordResetWithCodeUseCase.InputSchema)
    .output(ExecutePasswordResetWithCodeUseCase.OutputSchema)
    .handler(async ({ input }) => {
        return orpcSafe(async () => {
            const useCase = container.getExecutePasswordResetWithCodeUseCase();
            return useCase.execute(input);
        });
    });
