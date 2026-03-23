import { UserRepository } from "@identy/domain/repositories";
import { UseCase } from "@core/base-classes";
import { PaginatedQuery, PaginatedResult } from "@core/value-objects";
import { AuthUserService } from "@identy/domain/services";
import { User } from "@identy/domain/entities";
import z from "zod";

class ListUsersUseCase extends UseCase<ListUsersUseCase.Input, ListUsersUseCase.Result> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly userRepository: UserRepository,
    ) {
        super();
    }

    async execute(params: ListUsersUseCase.Input): Promise<ListUsersUseCase.Result> {
        this.authUserService.checkIsAdmin();
        const pagination = PaginatedQuery.create(params.pagination);
        const result = await this.userRepository.findAll(pagination, params.search ?? undefined);
        return result.toJSON();
    }
}

namespace ListUsersUseCase {
    export const InputSchema = z.object({
        pagination: PaginatedQuery.Schema,
        search: z.string().optional(),
    });

    export const OutputSchema = PaginatedResult.JsonSchema(User.JsonSchema);

    export type Input = z.infer<typeof InputSchema>;
    export type Result = z.infer<typeof OutputSchema>;
}

export { ListUsersUseCase };
