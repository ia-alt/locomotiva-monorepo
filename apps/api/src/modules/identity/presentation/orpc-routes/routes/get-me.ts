import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import { GetAuthUserUseCase } from "src/modules/identity/application/use-cases/get-auth-user";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";

export const getMeRoute = protectedRoute
    .route({ method: "GET", path: "/auth/me" })
    .input(GetAuthUserUseCase.InputSchema)
    .output(GetAuthUserUseCase.OutputSchema)
    .handler(async ({ context }) => {
        return orpcSafe(async () => {
            const getAuthUserUseCase = container.getGetAuthUserUseCase(context.user);
            return getAuthUserUseCase.execute();
        })
    });