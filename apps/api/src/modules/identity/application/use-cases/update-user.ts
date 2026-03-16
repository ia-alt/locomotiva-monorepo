import { UniqueId, UseCase } from "@core/base-classes";
import { AuthUserService } from "@identy/domain/services";
import { UserRepository } from "@identy/domain/repositories";
import { UserNotFoundError } from "@identy/domain/errors";
import { User } from "@identy/domain/entities";
import z from "zod";

class UpdateUserUseCase extends UseCase<UpdateUserUseCase.Input, UpdateUserUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly userRepository: UserRepository,
    ) {
        super();
    }

    async execute(input: UpdateUserUseCase.Input): Promise<UpdateUserUseCase.Output> {
        this.authUserService.checkIsAdmin();

        const userId = UniqueId.fromString(input.userId);
        const user = await this.userRepository.findById(userId);
        if (!user) throw new UserNotFoundError();

        user.update(input.data);
        await this.userRepository.save(user);
        return user.toJSON();
    }
}

namespace UpdateUserUseCase {
    export const InputSchema = z.object({
        userId: z.string(),
        data: User.UpdateSchema,
    });
    export const OutputSchema = User.JsonSchema;

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { UpdateUserUseCase };
