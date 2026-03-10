import { UseCase } from "@core/base-classes";
import { User } from "src/modules/identity/domain/entities";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";

class GetAuthUserUseCase implements UseCase<GetAuthUserUseCase.Input, GetAuthUserUseCase.Output> {
    constructor(private readonly authUserService: AuthUserService) { }
    async execute(): Promise<GetAuthUserUseCase.Output> {
        const user = this.authUserService.getUser();
        return user.toJSON();
    }
}

namespace GetAuthUserUseCase {
    export const InputSchema = z.object();

    export const OutputSchema = User.JsonSchema;

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { GetAuthUserUseCase };