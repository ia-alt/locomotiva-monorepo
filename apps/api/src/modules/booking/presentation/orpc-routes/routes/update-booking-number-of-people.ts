import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { UpdateBookingNumberOfPeopleUseCase } from "@booking/application/use-cases/update-booking-number-of-people";

export const updateBookingNumberOfPeopleRoute = protectedRoute
    .route({ method: "POST", path: "/bookings/{bookingId}/number-of-people" })
    .input(UpdateBookingNumberOfPeopleUseCase.InputSchema)
    .output(UpdateBookingNumberOfPeopleUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const useCase = container.getUpdateBookingNumberOfPeopleUseCase(context.user);
            return useCase.execute(input);
        });
    });
