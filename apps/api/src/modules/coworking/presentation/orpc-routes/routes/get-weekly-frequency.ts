import { protectedRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { GetWeeklyFrequencyUseCase } from "@coworking/application/use-cases/get-weekly-frequency";

export const getWeeklyFrequencyRoute = protectedRoute
    .route({ method: "GET", path: "/coworking/weekly-frequency" })
    .input(GetWeeklyFrequencyUseCase.InputSchema)
    .output(GetWeeklyFrequencyUseCase.OutputSchema)
    .handler(async ({ context }) => {
        return orpcSafe(async () => {
            const useCase = container.getWeeklyFrequencyUseCase(context.user);
            return useCase.execute();
        });
    });
