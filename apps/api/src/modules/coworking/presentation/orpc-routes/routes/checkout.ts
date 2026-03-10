import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { PerformCheckoutUseCase } from "@coworking/application/use-cases/perform-checkout";

export const performCheckoutRoute = protectedRoute
    .route({ method: "POST", path: "/coworking/checkout" })
    .input(PerformCheckoutUseCase.InputSchema)
    .output(PerformCheckoutUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const performCheckoutUseCase = container.getPerformCheckoutUseCase(context.user);
            return performCheckoutUseCase.execute(input);
        })
    });
