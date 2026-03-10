import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { SetRoomEnabledUseCase } from "@booking/application/use-cases/set-room-enabled";

export const setRoomEnabledRoute = protectedRoute
    .route({ method: "PUT", path: "/bookings/rooms/{roomId}/enabled" })
    .input(SetRoomEnabledUseCase.InputSchema)
    .output(SetRoomEnabledUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const setRoomEnabledUseCase = container.getSetRoomEnabledUseCase(context.user);
            return setRoomEnabledUseCase.execute(input);
        })
    });
