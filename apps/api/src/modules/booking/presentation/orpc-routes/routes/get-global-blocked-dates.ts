import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { GetGlobalBlockedDatesUseCase } from "@booking/application/use-cases/get-global-blocked-dates";

export const getGlobalBlockedDatesRoute = protectedRoute
    .route({ method: "GET", path: "/bookings/global-blocked-dates" })
    .input(GetGlobalBlockedDatesUseCase.InputSchema)
    .output(GetGlobalBlockedDatesUseCase.OutputSchema)
    .handler(async ({ context }) => {
        return orpcSafe(async () => {
            const useCase = container.getGetGlobalBlockedDatesUseCase(context.user);
            return useCase.execute();
        })
    });
