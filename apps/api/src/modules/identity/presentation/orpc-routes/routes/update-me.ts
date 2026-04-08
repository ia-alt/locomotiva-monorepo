import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import { UpdateMeUseCase } from "src/modules/identity/application/use-cases/update-me";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";

export const updateMeRoute = protectedRoute
    .route({ method: "PATCH", path: "/auth/me" })
    .input(UpdateMeUseCase.InputSchema)
    .output(UpdateMeUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const updateMeUseCase = container.getUpdateMeUseCase(context.user);
            return updateMeUseCase.execute(input);
        });
    });
