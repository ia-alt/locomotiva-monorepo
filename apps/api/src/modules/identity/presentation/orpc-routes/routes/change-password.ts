import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { ChangePasswordUseCase } from "src/modules/identity/application/use-cases/change-password";

export const changePasswordRoute = protectedRoute
    .route({ method: "PUT", path: "/auth/change-password" })
    .input(ChangePasswordUseCase.InputSchema)
    .output(ChangePasswordUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const changePasswordUseCase = container.getChangePasswordUseCase(context.user);
            return changePasswordUseCase.execute(input);
        })
    });
