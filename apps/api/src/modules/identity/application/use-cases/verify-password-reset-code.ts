import { UseCase } from "@core/base-classes";
import z from "zod";
import { PasswordService } from "src/modules/identity/domain/services";
import { Cpf } from "src/modules/identity/domain/value-objects/cpf";

class VerifyPasswordResetCodeUseCase implements UseCase<VerifyPasswordResetCodeUseCase.Input, VerifyPasswordResetCodeUseCase.Output> {
    constructor(
        private readonly passwordService: PasswordService,
    ) { }

    async execute(input: VerifyPasswordResetCodeUseCase.Input): Promise<VerifyPasswordResetCodeUseCase.Output> {
        const isValid = await this.passwordService.verifyPasswordResetCode({ cpf: input.cpf, code: input.code });
        return { valid: isValid };
    }
}

namespace VerifyPasswordResetCodeUseCase {
    export const InputSchema = z.object({
        cpf: Cpf.JsonSchema,
        code: z.string().length(6)
    });

    export const OutputSchema = z.object({
        valid: z.boolean()
    });

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { VerifyPasswordResetCodeUseCase };
