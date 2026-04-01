import { UseCase } from "@core/base-classes";
import z from "zod";
import { PasswordService } from "src/modules/identity/domain/services";
import { Cpf } from "src/modules/identity/domain/value-objects/cpf";
import { Password } from "src/modules/identity/domain/value-objects/password";

class ExecutePasswordResetWithCodeUseCase implements UseCase<ExecutePasswordResetWithCodeUseCase.Input, ExecutePasswordResetWithCodeUseCase.Output> {
    constructor(
        private readonly passwordService: PasswordService,
    ) { }

    async execute(input: ExecutePasswordResetWithCodeUseCase.Input): Promise<ExecutePasswordResetWithCodeUseCase.Output> {
        const password = Password.fromString(input.newPassword);
        const success = await this.passwordService.executeResetPasswordWithCode({ 
            cpf: input.cpf, 
            code: input.code, 
            newPassword: password 
        });
        
        return { success };
    }
}

namespace ExecutePasswordResetWithCodeUseCase {
    export const InputSchema = z.object({
        cpf: Cpf.JsonSchema,
        code: z.string().length(6),
        newPassword: Password.JsonSchema
    });

    export const OutputSchema = z.object({
        success: z.boolean()
    });

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { ExecutePasswordResetWithCodeUseCase };
