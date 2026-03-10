import { publicRoute } from "@core/presentation/orpc-server/route-types";
import { RegisterUserUseCase } from "src/modules/identity/application/use-cases/register-user";
import container from "@di/container";
import { orpcSafe } from "@core/presentation/orpc-server/orpc-safe";

export const registerUserRoute = publicRoute
    .route({ method: "POST", path: "/auth/register" })
    .input(RegisterUserUseCase.InputSchema)
    .output(RegisterUserUseCase.OutputSchema)
    .handler(async ({ input }) => {
        return orpcSafe(async () => {
            const registerUserUseCase = container.getRegisterUserUseCase();
            return registerUserUseCase.execute(input);
        })
    });