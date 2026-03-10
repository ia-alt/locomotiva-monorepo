import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { AddOperatingHoursOverrideUseCase } from "@booking/application/use-cases/add-room-operating-hours-override";

export const addOperatingHoursOverrideRoute = protectedRoute
    .route({ method: "PUT", path: "/bookings/rooms/{roomId}/operating-override" })
    .input(AddOperatingHoursOverrideUseCase.InputSchema)
    .output(AddOperatingHoursOverrideUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const addOperatingHoursOverrideUseCase = container.getAddOperatingHoursOverrideUseCase(context.user);
            return addOperatingHoursOverrideUseCase.execute(input);
        })
    });
