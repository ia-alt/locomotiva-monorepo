import { UseCase } from "@core/base-classes";
import z from "zod";
import { EmailAddress } from "@core/value-objects";
import { Cpf } from "src/modules/identity/domain/value-objects/cpf";
import { AuthService } from "src/modules/identity/domain/services";

class LoginUseCase implements UseCase<LoginUseCase.Input, LoginUseCase.Output> {
    constructor(
        private readonly authService: AuthService
    ) { }

    async execute(input: LoginUseCase.Input): Promise<LoginUseCase.Output> {
        const isEmail = input.identifier.includes("@");

        const emailOrCpf = isEmail
            ? new EmailAddress(input.identifier.toLowerCase())
            : Cpf.fromString(input.identifier)!;

        const session = await this.authService.login(emailOrCpf, input.password);

        return {
            token: session.token,
            refreshToken: session.refreshToken,
        };
    }
}

namespace LoginUseCase {
    export const InputSchema = z.object({
        identifier: z.string(),
        password: z.string(),
    });

    export const OutputSchema = z.object({
        token: z.string(),
        refreshToken: z.string(),
    });

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { LoginUseCase };
