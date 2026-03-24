import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { GetBookingByIdUseCase } from "@booking/application/use-cases/get-booking-by-id";

export const getBookingByIdRoute = protectedRoute
    .route({ method: "GET", path: "/bookings/{id}" })
    .input(GetBookingByIdUseCase.InputSchema)
    .output(GetBookingByIdUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const getBookingByIdUseCase = container.getGetBookingByIdUseCase(context.user);
            return getBookingByIdUseCase.execute(input);
        })
    });
