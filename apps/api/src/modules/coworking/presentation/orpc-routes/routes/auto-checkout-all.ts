import { systemRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { AutoCheckoutAllUseCase } from "@coworking/application/use-cases/auto-checkout-all";

export const autoCheckoutAllRoute = systemRoute
    .route({ method: "POST", path: "/coworking/auto-checkout-all" })
    .input(AutoCheckoutAllUseCase.InputSchema)
    .output(AutoCheckoutAllUseCase.OutputSchema)
    .handler(async () => {
        return orpcSafe(async () => {
            const autoCheckoutAllUseCase = container.getAutoCheckoutAllUseCase();
            return autoCheckoutAllUseCase.execute();
        })
    });
