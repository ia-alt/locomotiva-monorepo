import { publicRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { ExecutePasswordResetUseCase } from "src/modules/identity/application/use-cases/execute-password-reset";

export const executePasswordResetRoute = publicRoute
    .route({ method: "POST", path: "/auth/execute-password-reset" })
    .input(ExecutePasswordResetUseCase.InputSchema)
    .output(ExecutePasswordResetUseCase.OutputSchema)
    .handler(async ({ input }) => {
        return orpcSafe(async () => {
            const executePasswordResetUseCase = container.getExecutePasswordResetUseCase();
            return executePasswordResetUseCase.execute(input);
        })
    });
