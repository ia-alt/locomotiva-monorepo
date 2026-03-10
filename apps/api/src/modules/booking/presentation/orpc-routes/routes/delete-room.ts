import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { DeleteRoomUseCase } from "@booking/application/use-cases/delete-room";

export const deleteRoomRoute = protectedRoute
    .route({ method: "DELETE", path: "/bookings/rooms/{roomId}" })
    .input(DeleteRoomUseCase.InputSchema)
    .output(DeleteRoomUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const deleteRoomUseCase = container.getDeleteRoomUseCase(context.user);
            return deleteRoomUseCase.execute(input);
        })
    });
