import { UseCase } from "@core/base-classes";
import { Filament } from "@printing/domain/entities";
import { FilamentRepository } from "@printing/domain/repositories";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";

/** Lista o catálogo de filamentos — usado pelo cliente ao escolher o material. */
class ListFilamentsUseCase extends UseCase<ListFilamentsUseCase.Input, ListFilamentsUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly filamentRepository: FilamentRepository,
    ) {
        super();
    }

    async execute(): Promise<ListFilamentsUseCase.Output> {
        this.authUserService.getUser(); // qualquer usuário autenticado

        const filaments = await this.filamentRepository.findAllActive();
        return filaments.map((f) => f.toJSON());
    }
}

namespace ListFilamentsUseCase {
    export const InputSchema = z.object();
    export const OutputSchema = z.array(Filament.JsonSchema);

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { ListFilamentsUseCase };
