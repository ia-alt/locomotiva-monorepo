import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { ListPrintersUseCase } from "@printing/application/use-cases/list-printers";

export const listPrintersRoute = protectedRoute
    .route({ method: "GET", path: "/printing/printers" })
    .input(ListPrintersUseCase.InputSchema)
    .output(ListPrintersUseCase.OutputSchema)
    .handler(async ({ context }) => {
        return orpcSafe(async () => {
            const listPrintersUseCase = container.getListPrintersUseCase(context.user);
            return listPrintersUseCase.execute();
        });
    });
