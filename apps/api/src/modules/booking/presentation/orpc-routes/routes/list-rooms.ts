import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { ListRoomsUseCase } from "@booking/application/use-cases/list-rooms";

export const listRoomsRoute = protectedRoute
    .route({ method: "GET", path: "/bookings/rooms" })
    .input(ListRoomsUseCase.InputSchema)
    .output(ListRoomsUseCase.OutputSchema)
    .handler(async ({ context }) => {
        return orpcSafe(async () => {
            const listRoomsUseCase = container.getListRoomsUseCase(context.user);
            return listRoomsUseCase.execute();
        })
    });
