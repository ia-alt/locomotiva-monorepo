import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { ListAvailableSlotsByDayUseCase } from "@booking/application/use-cases/list-available-slots-by-day";

export const listAvailableSlotsByDayRoute = protectedRoute
    .route({ method: "GET", path: "/bookings/rooms/{roomId}/free-slots/{day}" })
    .input(ListAvailableSlotsByDayUseCase.InputSchema)
    .output(ListAvailableSlotsByDayUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const listAvailableSlotsByDayUseCase = container.getListAvailableSlotsByDayUseCase(context.user);
            return listAvailableSlotsByDayUseCase.execute(input);
        })
    });
