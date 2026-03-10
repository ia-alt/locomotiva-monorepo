import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { UpdateRoomUseCase } from "@booking/application/use-cases/update-room";

export const updateRoomRoute = protectedRoute
    .route({ method: "PUT", path: "/bookings/rooms/{roomId}" })
    .input(UpdateRoomUseCase.InputSchema)
    .output(UpdateRoomUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const updateRoomUseCase = container.getUpdateRoomUseCase(context.user);
            return updateRoomUseCase.execute(input);
        })
    });
