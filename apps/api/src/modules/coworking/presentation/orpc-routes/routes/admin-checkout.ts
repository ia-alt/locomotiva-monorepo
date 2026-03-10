import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { AdminPerformCheckoutUseCase } from "@coworking/application/use-cases/admin-perform-checkout";

export const adminPerformCheckoutRoute = protectedRoute
    .route({ method: "POST", path: "/coworking/admin/checkout" })
    .input(AdminPerformCheckoutUseCase.InputSchema)
    .output(AdminPerformCheckoutUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const adminPerformCheckoutUseCase = container.getAdminPerformCheckoutUseCase(context.user);
            return adminPerformCheckoutUseCase.execute(input);
        })
    });
