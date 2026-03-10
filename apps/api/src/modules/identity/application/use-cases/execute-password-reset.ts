import { UseCase } from "@core/base-classes";
import z from "zod";
import { Password } from "src/modules/identity/domain/value-objects/password";
import { PasswordService } from "src/modules/identity/domain/services";

class ExecutePasswordResetUseCase implements UseCase<ExecutePasswordResetUseCase.Input, ExecutePasswordResetUseCase.Output> {
    constructor(
        private readonly passwordService: PasswordService,
    ) { }

    async execute(input: ExecutePasswordResetUseCase.Input): Promise<ExecutePasswordResetUseCase.Output> {
        await this.passwordService.executeResetPassword({
            token: input.token,
            newPassword: Password.fromString(input.newPassword),
        });
    }
}

namespace ExecutePasswordResetUseCase {
    export const InputSchema = z.object({
        token: z.string().min(1),
        newPassword: Password.JsonSchema,
    });

    export const OutputSchema = z.void();

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { ExecutePasswordResetUseCase };
