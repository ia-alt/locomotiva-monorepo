import { systemRoute } from "@core/presentation/orpc-server/route-types";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";
import { GenerateTotemAccessCodeUseCase } from "@coworking/application/use-cases/generate-totem-access-code";

export const generateTotemAccessCodeRoute = systemRoute
    .route({ method: "POST", path: "/coworking/totem/access-code" })
    .input(GenerateTotemAccessCodeUseCase.InputSchema)
    .output(GenerateTotemAccessCodeUseCase.OutputSchema)
    .handler(async ({ input, context }) => {
        return orpcSafe(async () => {
            const useCase = container.getGenerateTotemAccessCodeUseCase(context.apiKey);
            return useCase.execute(input);
        });
    });
