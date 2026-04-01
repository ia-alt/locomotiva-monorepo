import { UseCase } from "@core/base-classes";
import z from "zod";
import { ORPCError } from "@orpc/server";
import { AuthUserService } from "../../domain/services";
import { ApiKeyRepository } from "../../domain/repositories/api-key-repository";

export class RevokeApiKeyUseCase implements UseCase<RevokeApiKeyUseCase.Input, void> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly apiKeyRepository: ApiKeyRepository,
    ) { }

    async execute(input: RevokeApiKeyUseCase.Input): Promise<void> {
        this.authUserService.checkIsAdmin();

        const apiKey = await this.apiKeyRepository.findById(input.id);

        if (!apiKey) {
            throw new ORPCError('NOT_FOUND', { message: "API Key não encontrada." });
        }

        await this.apiKeyRepository.delete(input.id);
    }
}

export namespace RevokeApiKeyUseCase {
    export const InputSchema = z.object({
        id: z.string().min(1),
    });

    export type Input = z.infer<typeof InputSchema>;
}
