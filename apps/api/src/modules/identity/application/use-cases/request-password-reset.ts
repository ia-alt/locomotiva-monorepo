import { UseCase } from "@core/base-classes";
import z from "zod";
import { EmailAddress } from "@core/value-objects";
import { PasswordService } from "src/modules/identity/domain/services";

class RequestPasswordResetUseCase implements UseCase<RequestPasswordResetUseCase.Input, RequestPasswordResetUseCase.Output> {
    constructor(
        private readonly passwordService: PasswordService,
    ) { }

    async execute(input: RequestPasswordResetUseCase.Input): Promise<RequestPasswordResetUseCase.Output> {
        const email = EmailAddress.fromString(input.email);

        await this.passwordService.requestResetPassword({ email });
    }
}

namespace RequestPasswordResetUseCase {
    export const EmailSchema = EmailAddress.JsonSchema;

    export const InputSchema = z.object({
        email: EmailSchema
    });

    export const OutputSchema = z.void();

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { RequestPasswordResetUseCase };
