import { systemRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { FindMemberByCpfUseCase } from "@coworking/application/use-cases/find-member-by-cpf";

export const findMemberByCpfRoute = systemRoute
    .route({ method: "POST", path: "/coworking/find-member-by-cpf" })
    .input(FindMemberByCpfUseCase.InputSchema)
    .output(FindMemberByCpfUseCase.OutputSchema)
    .handler(async ({ input }) => {
        return orpcSafe(async () => {
            const useCase = container.getFindMemberByCpfUseCase();
            return useCase.execute(input);
        });
    });
