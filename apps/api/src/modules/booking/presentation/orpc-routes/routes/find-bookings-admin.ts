import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { FindBookingsAdminUseCase } from "@booking/application/use-cases/find-bookings-admin";

export const findBookingsAdminRoute = protectedRoute
    .route({ method: "POST", path: "/bookings/admin-search" })
    .input(FindBookingsAdminUseCase.InputSchema)
    .output(FindBookingsAdminUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const useCase = container.getFindBookingsAdminUseCase(context.user);
            return useCase.execute(input);
        });
    });
