import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { ProcessBookingRequestUseCase } from "@booking/application/use-cases/process-booking-request";

export const processBookingRequestRoute = protectedRoute
    .route({ method: "POST", path: "/bookings/{bookingId}/process" })
    .input(ProcessBookingRequestUseCase.InputSchema)
    .output(ProcessBookingRequestUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const processBookingRequestUseCase = container.getProcessBookingRequestUseCase(context.user);
            return processBookingRequestUseCase.execute(input);
        })
    });
