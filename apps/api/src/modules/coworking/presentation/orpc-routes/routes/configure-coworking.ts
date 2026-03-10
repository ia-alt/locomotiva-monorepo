import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { ConfigureCoworkingUseCase } from "@coworking/application/use-cases/configure-coworking";

export const configureCoworkingRoute = protectedRoute
    .route({ method: "PUT", path: "/coworking/settings" })
    .input(ConfigureCoworkingUseCase.InputSchema)
    .output(ConfigureCoworkingUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const configureCoworkingUseCase = container.getConfigureCoworkingUseCase(context.user);
            return configureCoworkingUseCase.execute(input);
        })
    });
