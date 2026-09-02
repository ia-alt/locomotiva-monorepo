import { publicRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { LogoutUseCase } from "src/modules/identity/application/use-cases/logout";

export const logoutRoute = publicRoute
    .route({ method: "POST", path: "/auth/logout" })
    .input(LogoutUseCase.InputSchema)
    .output(LogoutUseCase.OutputSchema)
    .handler(async ({ input }) => {
        return orpcSafe(async () => {
            const logoutUseCase = container.getLogoutUseCase();
            return logoutUseCase.execute(input);
        })
    });
