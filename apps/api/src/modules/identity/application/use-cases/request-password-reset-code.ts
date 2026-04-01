import { UseCase } from "@core/base-classes";
import z from "zod";
import { PasswordService } from "src/modules/identity/domain/services";
import { Cpf } from "src/modules/identity/domain/value-objects/cpf";

class RequestPasswordResetCodeUseCase implements UseCase<RequestPasswordResetCodeUseCase.Input, RequestPasswordResetCodeUseCase.Output> {
    constructor(
        private readonly passwordService: PasswordService,
    ) { }

    async execute(input: RequestPasswordResetCodeUseCase.Input): Promise<RequestPasswordResetCodeUseCase.Output> {
        const result = await this.passwordService.requestResetPasswordWithCode({ cpf: input.cpf });
        return { maskedEmail: result?.maskedEmail ?? null };
    }
}

namespace RequestPasswordResetCodeUseCase {
    export const InputSchema = z.object({
        cpf: Cpf.JsonSchema
    });

    export const OutputSchema = z.object({
        maskedEmail: z.string().nullable(),
    });

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { RequestPasswordResetCodeUseCase };
