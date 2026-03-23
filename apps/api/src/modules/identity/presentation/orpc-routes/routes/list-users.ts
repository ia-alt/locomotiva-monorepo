import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import { ListUsersUseCase } from "src/modules/identity/application/use-cases/list-users";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";

export const listUsersRoute = protectedRoute
    .route({ method: "GET", path: "/users" })
    .input(ListUsersUseCase.InputSchema)
    .output(ListUsersUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const listUsersUseCase = container.getListUsersUseCase(context.user);
            return listUsersUseCase.execute(input);
        });
    });
