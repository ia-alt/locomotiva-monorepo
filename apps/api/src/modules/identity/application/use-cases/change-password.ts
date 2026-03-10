import { UseCase } from "@core/base-classes";
import z from "zod";
import { AuthUserService, PasswordService } from "src/modules/identity/domain/services";
import { Password } from "src/modules/identity/domain/value-objects/password";

class ChangePasswordUseCase implements UseCase<ChangePasswordUseCase.Input, ChangePasswordUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly passwordService: PasswordService,
    ) { }

    async execute(input: ChangePasswordUseCase.Input): Promise<ChangePasswordUseCase.Output> {
        const user = this.authUserService.getUser();
        const newPassword = Password.fromString(input.newPassword);

        await this.passwordService.changePassword({
            user,
            currentPassword: input.currentPassword,
            newPassword,
        });
    }
}

namespace ChangePasswordUseCase {
    export const InputSchema = z.object({
        currentPassword: z.string(),
        newPassword: Password.JsonSchema,
    });

    export const OutputSchema = z.void();

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { ChangePasswordUseCase };

