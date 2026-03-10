import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { SetDefaultOperatingScheduleUseCase } from "@booking/application/use-cases/set-room-default-operating-hours";

export const setDefaultOperatingScheduleRoute = protectedRoute
    .route({ method: "PUT", path: "/bookings/rooms/{roomId}/operating-schedule" })
    .input(SetDefaultOperatingScheduleUseCase.InputSchema)
    .output(SetDefaultOperatingScheduleUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const setDefaultOperatingScheduleUseCase = container.getSetDefaultOperatingScheduleUseCase(context.user);
            return setDefaultOperatingScheduleUseCase.execute(input);
        })
    });
