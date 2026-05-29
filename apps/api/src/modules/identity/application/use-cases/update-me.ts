import { UseCase } from "@core/base-classes";
import { AuthUserService } from "@identy/domain/services";
import { UserRepository } from "@identy/domain/repositories";
import { User } from "@identy/domain/entities";
import { EmailAddress } from "@core/value-objects";
import { BirthDate } from "src/modules/identity/domain/value-objects/birth-date";
import z from "zod";

class UpdateMeUseCase extends UseCase<UpdateMeUseCase.Input, UpdateMeUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly userRepository: UserRepository,
    ) {
        super();
    }

    async execute(input: UpdateMeUseCase.Input): Promise<UpdateMeUseCase.Output> {
        const user = this.authUserService.getUser();

        user.updateSelf({
            name: input.name,
            email: EmailAddress.fromString(input.email),
            birthDate: BirthDate.fromJSON(input.birthDate),
            company: input.company,
            jobTitle: input.jobTitle,
            phone: input.phone,
        });

        await this.userRepository.save(user);
        return user.toJSON();
    }
}

namespace UpdateMeUseCase {
    export const InputSchema = z.object({
        name: z.string().min(1),
        email: EmailAddress.JsonSchema,
        birthDate: BirthDate.JsonSchema,
        company: z.string().nullable().optional(),
        jobTitle: z.string().nullable().optional(),
        phone: z.string(),
    });
    export const OutputSchema = User.JsonSchema;

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { UpdateMeUseCase };
