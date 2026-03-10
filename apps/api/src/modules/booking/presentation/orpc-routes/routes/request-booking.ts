import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { RequestBookingUseCase } from "@booking/application/use-cases/request-booking";

export const requestBookingRoute = protectedRoute
    .route({ method: "POST", path: "/bookings" })
    .input(RequestBookingUseCase.InputSchema)
    .output(RequestBookingUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const requestBookingUseCase = container.getRequestBookingUseCase(context.user);
            return requestBookingUseCase.execute(input);
        })
    });
