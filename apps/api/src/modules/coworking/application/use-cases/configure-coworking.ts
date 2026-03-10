import { UseCase } from "@core/base-classes";
import { CoworkingSettings } from "@coworking/domain/entities";
import { CoworkingSettingsRepository } from "@coworking/domain/repositories";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";

class ConfigureCoworkingUseCase implements UseCase<ConfigureCoworkingUseCase.Input, ConfigureCoworkingUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly coworkingSettingsRepository: CoworkingSettingsRepository,
    ) { }

    async execute(input: ConfigureCoworkingUseCase.Input): Promise<ConfigureCoworkingUseCase.Output> {
        this.authUserService.checkIsAdmin();

        const coworkingSettings = await this.coworkingSettingsRepository.get();

        coworkingSettings.updateCapacity(input.maxCapacity);
        await this.coworkingSettingsRepository.save(coworkingSettings);

        return {
            coworkingSettings: coworkingSettings.toJSON(),
        };
    }
}

namespace ConfigureCoworkingUseCase {

    export const InputSchema = z.object({
        maxCapacity: z.number(),
    });

    export const OutputSchema = z.object({
        coworkingSettings: CoworkingSettings.JsonSchema,
    });

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { ConfigureCoworkingUseCase };
