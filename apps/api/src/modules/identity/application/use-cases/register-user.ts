import { UseCase } from "@core/base-classes";
import z from "zod";
import { User } from "src/modules/identity/domain/entities";
import { Password } from "src/modules/identity/domain/value-objects/password";
import { Cpf } from "src/modules/identity/domain/value-objects/cpf";
import { BirthDate } from "src/modules/identity/domain/value-objects/birth-date";
import { EmailAddress } from "@core/value-objects";
import { AuthService } from "src/modules/identity/domain/services";

class RegisterUserUseCase implements UseCase<RegisterUserUseCase.Input, RegisterUserUseCase.Output> {
    constructor(
        private readonly authService: AuthService,
    ) { }

    async execute(input: RegisterUserUseCase.Input): Promise<RegisterUserUseCase.Output> {
        const email = EmailAddress.fromString(input.email);
        const cpf = Cpf.fromString(input.cpf);
        const birthDate = BirthDate.fromJSON(input.birthDate);
        const password = Password.fromString(input.password);

        const user = await this.authService.register({
            name: input.name,
            email,
            cpf,
            birthDate,
            password,
        });

        return user.toJSON();
    }
}

namespace RegisterUserUseCase {
    export const InputSchema = z.object({
        name: z.string(),
        email: EmailAddress.JsonSchema,
        cpf: Cpf.JsonSchema,
        birthDate: BirthDate.JsonSchema,
        password: Password.JsonSchema,
    });

    export const OutputSchema = User.JsonSchema;

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { RegisterUserUseCase };
