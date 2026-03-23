import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import { UpdateUserUseCase } from "src/modules/identity/application/use-cases/update-user";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";

export const updateUserRoute = protectedRoute
    .route({ method: "PATCH", path: "/users/{userId}" })
    .input(UpdateUserUseCase.InputSchema)
    .output(UpdateUserUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const updateUserUseCase = container.getUpdateUserUseCase(context.user);
            return updateUserUseCase.execute(input);
        });
    });
