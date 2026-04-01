import { systemRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { FindActiveMemberByCpfUseCase } from "@coworking/application/use-cases/find-active-member-by-cpf";

export const findActiveMemberByCpfRoute = systemRoute
    .route({ method: "POST", path: "/coworking/find-active-member-by-cpf" })
    .input(FindActiveMemberByCpfUseCase.InputSchema)
    .output(FindActiveMemberByCpfUseCase.OutputSchema)
    .handler(async ({ input }) => {
        return orpcSafe(async () => {
            const useCase = container.getFindActiveMemberByCpfUseCase();
            return useCase.execute(input);
        });
    });
