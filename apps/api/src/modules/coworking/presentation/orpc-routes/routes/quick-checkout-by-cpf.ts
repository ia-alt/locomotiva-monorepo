import { systemRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { QuickCheckoutByCpfUseCase } from "@coworking/application/use-cases/quick-checkout-by-cpf";

export const quickCheckoutByCpfRoute = systemRoute
    .route({ method: "POST", path: "/coworking/quick-checkout-by-cpf" })
    .input(QuickCheckoutByCpfUseCase.InputSchema)
    .output(QuickCheckoutByCpfUseCase.OutputSchema)
    .handler(async ({ input }) => {
        return orpcSafe(async () => {
            const useCase = container.getQuickCheckoutByCpfUseCase();
            return useCase.execute(input);
        });
    });
