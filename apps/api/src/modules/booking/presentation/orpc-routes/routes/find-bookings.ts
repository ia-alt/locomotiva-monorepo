import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { FindBookingsUseCase } from "@booking/application/use-cases/find-bookings";

export const findBookingsRoute = protectedRoute
    .route({ method: "POST", path: "/bookings/search" })
    .input(FindBookingsUseCase.InputSchema)
    .output(FindBookingsUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const findBookingsUseCase = container.getFindBookingsUseCase(context.user);
            return findBookingsUseCase.execute(input);
        })
    });
