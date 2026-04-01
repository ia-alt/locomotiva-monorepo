import { UseCase } from "@core/base-classes";
import { AuthUserService } from "../../domain/services";
import { ApiKeyRepository } from "../../domain/repositories/api-key-repository";
import z from "zod";

export class DeleteApiKeyUseCase implements UseCase<DeleteApiKeyUseCase.Input, DeleteApiKeyUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly apiKeyRepository: ApiKeyRepository,
    ) { }

    async execute(input: DeleteApiKeyUseCase.Input): Promise<DeleteApiKeyUseCase.Output> {
        this.authUserService.checkIsAdmin();

        await this.apiKeyRepository.delete(input.id);
    }
}

export namespace DeleteApiKeyUseCase {
    export const InputSchema = z.object({
        id: z.string(),
    });

    export const OutputSchema = z.void();

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}
