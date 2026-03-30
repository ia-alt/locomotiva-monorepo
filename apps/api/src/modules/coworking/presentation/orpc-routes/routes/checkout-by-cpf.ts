import { systemRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { CheckoutByCpfUseCase } from "@coworking/application/use-cases/checkout-by-cpf";

export const checkoutByCpfRoute = systemRoute
    .route({ method: "POST", path: "/coworking/checkout-by-cpf" })
    .input(CheckoutByCpfUseCase.InputSchema)
    .output(CheckoutByCpfUseCase.OutputSchema)
    .handler(async ({ input }) => {
        return orpcSafe(async () => {
            const useCase = container.getCheckoutByCpfUseCase();
            return useCase.execute(input);
        });
    });
