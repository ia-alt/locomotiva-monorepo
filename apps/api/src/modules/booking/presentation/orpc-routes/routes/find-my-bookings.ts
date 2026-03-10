import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { FindMyBookingsUseCase } from "@booking/application/use-cases/find-my-bookings";

export const findMyBookingsRoute = protectedRoute
    .route({ method: "POST", path: "/bookings/mine/search" })
    .input(FindMyBookingsUseCase.InputSchema)
    .output(FindMyBookingsUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const findMyBookingsUseCase = container.getFindMyBookingsUseCase(context.user);
            return findMyBookingsUseCase.execute(input);
        })
    });
