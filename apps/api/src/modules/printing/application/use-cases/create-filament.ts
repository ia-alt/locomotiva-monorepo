import { UseCase } from "@core/base-classes";
import { Filament } from "@printing/domain/entities";
import { FilamentRepository } from "@printing/domain/repositories";
import { FilamentAlreadyExistsError } from "@printing/domain/errors";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";

class CreateFilamentUseCase extends UseCase<CreateFilamentUseCase.Input, CreateFilamentUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly filamentRepository: FilamentRepository,
    ) {
        super();
    }

    async execute(params: CreateFilamentUseCase.Input): Promise<CreateFilamentUseCase.Output> {
        this.authUserService.checkIsAdmin();

        const existing = await this.filamentRepository.findByName(params.name);
        if (existing) {
            throw new FilamentAlreadyExistsError(params.name);
        }

        const filament = Filament.create({ name: params.name });
        await this.filamentRepository.save(filament);
        return filament.toJSON();
    }
}

namespace CreateFilamentUseCase {
    export const InputSchema = Filament.CreateSchema;
    export const OutputSchema = Filament.JsonSchema;

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { CreateFilamentUseCase };
