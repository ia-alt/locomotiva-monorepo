import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { SetGlobalBlockedDatesUseCase } from "@booking/application/use-cases/set-global-blocked-dates";

export const setGlobalBlockedDatesRoute = protectedRoute
    .route({ method: "PUT", path: "/bookings/global-blocked-dates" })
    .input(SetGlobalBlockedDatesUseCase.InputSchema)
    .output(SetGlobalBlockedDatesUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const useCase = container.getSetGlobalBlockedDatesUseCase(context.user);
            return useCase.execute(input);
        })
    });
