import { UseCase } from "@core/base-classes";
import { AuthApiKeyService } from "src/modules/identity/domain/services";
import { TotemCheckinAccessCodeManager } from "../services/totem-checkin-access-code-manager";
import z from "zod";

class GenerateTotemAccessCodeUseCase implements UseCase<GenerateTotemAccessCodeUseCase.Input, GenerateTotemAccessCodeUseCase.Output> {
    constructor(
        private readonly authApiKeyService: AuthApiKeyService,
        private readonly accessCodeManager: TotemCheckinAccessCodeManager,
    ) { }

    async execute(input: GenerateTotemAccessCodeUseCase.Input): Promise<GenerateTotemAccessCodeUseCase.Output> {
        const apiKey = this.authApiKeyService.getApiKey();
        const code = await this.accessCodeManager.generateAccessCode(apiKey);

        return {
            code
        };
    }
}

namespace GenerateTotemAccessCodeUseCase {
    export const InputSchema = z.object({});
    export const OutputSchema = z.object({
        code: z.string(),
    });

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { GenerateTotemAccessCodeUseCase };
