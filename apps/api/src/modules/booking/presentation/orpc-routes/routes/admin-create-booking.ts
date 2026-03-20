import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { AdminCreateBookingUseCase } from "@booking/application/use-cases/admin-create-booking";

export const adminCreateBookingRoute = protectedRoute
    .route({ method: "POST", path: "/bookings/admin-create" })
    .input(AdminCreateBookingUseCase.InputSchema)
    .output(AdminCreateBookingUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const useCase = container.getAdminCreateBookingUseCase(context.user);
            return useCase.execute(input);
        });
    });
