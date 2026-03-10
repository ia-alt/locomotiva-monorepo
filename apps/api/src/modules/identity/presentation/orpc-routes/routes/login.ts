import { publicRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { LoginUseCase } from "src/modules/identity/application/use-cases/login";

export const loginRoute = publicRoute
    .route({ method: "POST", path: "/auth/login" })
    .input(LoginUseCase.InputSchema)
    .output(LoginUseCase.OutputSchema)
    .handler(async ({ input }) => {
        return orpcSafe(async () => {
            const loginUseCase = container.getLoginUseCase();
            return loginUseCase.execute(input);
        })
    });