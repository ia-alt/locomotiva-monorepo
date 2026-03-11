import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { GetRoomByIdUseCase } from "@booking/application/use-cases/get-room-by-id";

export const getRoomByIdRoute = protectedRoute
    .route({ method: "GET", path: "/bookings/rooms/{id}" })
    .input(GetRoomByIdUseCase.InputSchema)
    .output(GetRoomByIdUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const getRoomByIdUseCase = container.getGetRoomByIdUseCase(context.user);
            return getRoomByIdUseCase.execute(input);
        })
    });
