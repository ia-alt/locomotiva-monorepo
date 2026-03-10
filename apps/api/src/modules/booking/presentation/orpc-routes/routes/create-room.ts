import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { CreateRoomUseCase } from "@booking/application/use-cases/create-room";

export const createRoomRoute = protectedRoute
    .route({ method: "POST", path: "/bookings/rooms" })
    .input(CreateRoomUseCase.InputSchema)
    .output(CreateRoomUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const createRoomUseCase = container.getCreateRoomUseCase(context.user);
            return createRoomUseCase.execute(input);
        })
    });
