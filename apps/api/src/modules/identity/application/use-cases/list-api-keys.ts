import { UseCase } from "@core/base-classes";
import z from "zod";
import { AuthUserService } from "../../domain/services";
import { ApiKeyRepository } from "../../domain/repositories/api-key-repository";
import { ApiKey } from "../../domain/entities/api-key";

export class ListApiKeysUseCase implements UseCase<void, ListApiKeysUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly apiKeyRepository: ApiKeyRepository,
    ) { }

    async execute(): Promise<ListApiKeysUseCase.Output> {
        this.authUserService.checkIsAdmin();

        const apiKeys = await this.apiKeyRepository.findAll();

        return {
            apiKeys: apiKeys.map((key) => key.toJSON()),
        };
    }
}

export namespace ListApiKeysUseCase {
    export const OutputSchema = z.object({
        apiKeys: z.array(ApiKey.JsonSchema),
    });

    export type Output = z.infer<typeof OutputSchema>;
}
