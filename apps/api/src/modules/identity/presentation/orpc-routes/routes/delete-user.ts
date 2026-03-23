import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import { DeleteUserUseCase } from "src/modules/identity/application/use-cases/delete-user";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";

export const deleteUserRoute = protectedRoute
    .route({ method: "DELETE", path: "/users/{userId}" })
    .input(DeleteUserUseCase.InputSchema)
    .output(DeleteUserUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const deleteUserUseCase = container.getDeleteUserUseCase(context.user);
            return deleteUserUseCase.execute(input);
        });
    });
