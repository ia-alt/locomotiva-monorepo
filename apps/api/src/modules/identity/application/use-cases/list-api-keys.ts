import { UseCase } from "@core/base-classes";
import { AuthUserService } from "../../domain/services";
import { ApiKeyRepository } from "../../domain/repositories/api-key-repository";
import { PaginatedQuery, PaginatedResult } from "@core/value-objects";
import { ApiKey } from "../../domain/entities/api-key";
import z from "zod";

export class ListApiKeysUseCase implements UseCase<ListApiKeysUseCase.Input, ListApiKeysUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly apiKeyRepository: ApiKeyRepository,
    ) { }

    async execute(input: ListApiKeysUseCase.Input): Promise<ListApiKeysUseCase.Output> {
        this.authUserService.checkIsAdmin();

        const pagination = PaginatedQuery.create(input.pagination);
        const result = await this.apiKeyRepository.findAll(pagination, input.search);

        return result.toJSON();
    }
}

export namespace ListApiKeysUseCase {
    export const InputSchema = z.object({
        pagination: PaginatedQuery.Schema,
        search: z.string().optional(),
    });

    export const OutputSchema = PaginatedResult.JsonSchema(ApiKey.JsonSchema);

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}
