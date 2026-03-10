import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { CancelBookingUseCase } from "@booking/application/use-cases/cancel-booking";

export const cancelBookingRoute = protectedRoute
    .route({ method: "POST", path: "/bookings/{bookingId}/cancel" })
    .input(CancelBookingUseCase.InputSchema)
    .output(CancelBookingUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const cancelBookingUseCase = container.getCancelBookingUseCase(context.user);
            return cancelBookingUseCase.execute(input);
        })
    });
