import { systemRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { CheckinByCpfUseCase } from "@coworking/application/use-cases/checkin-by-cpf";

export const checkinByCpfRoute = systemRoute
    .route({ method: "POST", path: "/coworking/checkin-by-cpf" })
    .input(CheckinByCpfUseCase.InputSchema)
    .output(CheckinByCpfUseCase.OutputSchema)
    .handler(async ({ input }) => {
        return orpcSafe(async () => {
            const useCase = container.getCheckinByCpfUseCase();
            return useCase.execute(input);
        });
    });
