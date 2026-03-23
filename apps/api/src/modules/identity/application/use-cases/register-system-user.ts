import { UseCase } from "@core/base-classes";
import z from "zod";
import { User } from "src/modules/identity/domain/entities";
import { Password } from "src/modules/identity/domain/value-objects/password";
import { BirthDate } from "src/modules/identity/domain/value-objects/birth-date";
import { EmailAddress } from "@core/value-objects";
import { UserRepository } from "src/modules/identity/domain/repositories";
import { PasswordHashService } from "src/modules/identity/domain/services";
import { UserAlreadyExistsWithEmailOrCpfError } from "src/modules/identity/domain/errors";

class RegisterSystemUserUseCase implements UseCase<RegisterSystemUserUseCase.Input, RegisterSystemUserUseCase.Output> {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly passwordHashService: PasswordHashService,
    ) { }

    async execute(input: RegisterSystemUserUseCase.Input): Promise<RegisterSystemUserUseCase.Output> {
        const email = EmailAddress.fromString(input.email);
        const birthDate = BirthDate.fromJSON(input.birthDate);
        const password = Password.fromString(input.password);

        const existing = await this.userRepository.findByEmailOrCpf(email);
        if (existing) {
            throw new UserAlreadyExistsWithEmailOrCpfError();
        }

        const passwordHash = await this.passwordHashService.hash(password.value);

        const user = User.createSystem({
            name: input.name,
            email,
            birthDate,
            passwordHash,
        });

        await this.userRepository.save(user);
        return user.toJSON();
    }
}

namespace RegisterSystemUserUseCase {
    export const InputSchema = z.object({
        name: z.string(),
        email: EmailAddress.JsonSchema,
        birthDate: BirthDate.JsonSchema,
        password: Password.JsonSchema,
    });

    export const OutputSchema = User.JsonSchema;

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { RegisterSystemUserUseCase };
