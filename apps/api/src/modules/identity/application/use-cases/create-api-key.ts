import { UseCase } from "@core/base-classes";
import z from "zod";
import * as crypto from "crypto";
import { AuthUserService } from "../../domain/services";
import { ApiKeyRepository } from "../../domain/repositories/api-key-repository";
import { ApiKey } from "../../domain/entities/api-key";

export class CreateApiKeyUseCase implements UseCase<CreateApiKeyUseCase.Input, CreateApiKeyUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly apiKeyRepository: ApiKeyRepository,
    ) { }

    async execute(input: CreateApiKeyUseCase.Input): Promise<CreateApiKeyUseCase.Output> {
        this.authUserService.checkIsAdmin();

        const plainKey = crypto.randomBytes(32).toString('hex');
        const keyHash = crypto.createHash('sha256').update(plainKey).digest('hex');

        const apiKey = ApiKey.create({
            name: input.name,
            keyHash,
        });

        await this.apiKeyRepository.save(apiKey);

        return {
            id: apiKey.id.value,
            name: apiKey.name,
            plainKey,
        };
    }
}

export namespace CreateApiKeyUseCase {
    export const InputSchema = z.object({
        name: z.string().min(1, "Nome é obrigatório"),
    });

    export const OutputSchema = z.object({
        id: z.string(),
        name: z.string(),
        plainKey: z.string(),
    });

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}
