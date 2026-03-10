import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { AdminCancelBookingUseCase } from "@booking/application/use-cases/admin-cancel-booking";

export const adminCancelBookingRoute = protectedRoute
    .route({ method: "POST", path: "/bookings/{bookingId}/admin-cancel" })
    .input(AdminCancelBookingUseCase.InputSchema)
    .output(AdminCancelBookingUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const adminCancelBookingUseCase = container.getAdminCancelBookingUseCase(context.user);
            return adminCancelBookingUseCase.execute(input);
        })
    });
