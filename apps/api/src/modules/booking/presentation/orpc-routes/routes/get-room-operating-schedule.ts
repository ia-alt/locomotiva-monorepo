import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { GetRoomOperatingScheduleUseCase } from "@booking/application/use-cases/get-room-operating-schedule";

export const getRoomOperatingScheduleRoute = protectedRoute
    .route({ method: "GET", path: "/bookings/rooms/{roomId}/operating-schedule" })
    .input(GetRoomOperatingScheduleUseCase.InputSchema)
    .output(GetRoomOperatingScheduleUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const useCase = container.getGetRoomOperatingScheduleUseCase(context.user);
            return useCase.execute(input);
        })
    });
