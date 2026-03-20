import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { MarkBookingNoShowUseCase } from "@booking/application/use-cases/mark-booking-no-show";

export const markBookingNoShowRoute = protectedRoute
    .route({ method: "POST", path: "/bookings/{bookingId}/no-show" })
    .input(MarkBookingNoShowUseCase.InputSchema)
    .output(MarkBookingNoShowUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const useCase = container.getMarkBookingNoShowUseCase(context.user);
            return useCase.execute(input);
        });
    });
