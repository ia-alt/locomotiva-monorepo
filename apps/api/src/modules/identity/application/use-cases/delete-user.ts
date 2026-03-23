import { UniqueId, UseCase } from "@core/base-classes";
import { AuthUserService } from "@identy/domain/services";
import { UserRepository } from "@identy/domain/repositories";
import { UserNotFoundError } from "@identy/domain/errors";
import z from "zod";

class DeleteUserUseCase extends UseCase<DeleteUserUseCase.Input, DeleteUserUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly userRepository: UserRepository,
    ) {
        super();
    }

    async execute(input: DeleteUserUseCase.Input): Promise<DeleteUserUseCase.Output> {
        this.authUserService.checkIsAdmin();

        const userId = UniqueId.fromString(input.userId);
        const user = await this.userRepository.findById(userId);
        if (!user) throw new UserNotFoundError();

        await this.userRepository.delete(userId);
    }
}

namespace DeleteUserUseCase {
    export const InputSchema = z.object({
        userId: z.string(),
    });
    export const OutputSchema = z.void();

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { DeleteUserUseCase };
