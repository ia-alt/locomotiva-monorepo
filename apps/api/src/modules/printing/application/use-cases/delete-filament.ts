import { UniqueId, UseCase } from "@core/base-classes";
import { FilamentRepository, PrintRequestRepository } from "@printing/domain/repositories";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";
import { FilamentNotFoundError } from "../errors";

class DeleteFilamentUseCase extends UseCase<DeleteFilamentUseCase.Input, DeleteFilamentUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly filamentRepository: FilamentRepository,
        private readonly printRequestRepository: PrintRequestRepository,
    ) {
        super();
    }

    async execute(params: DeleteFilamentUseCase.Input): Promise<DeleteFilamentUseCase.Output> {
        this.authUserService.checkIsAdmin();
        const id = UniqueId.fromString(params.id);

        const filament = await this.filamentRepository.findById(id);
        if (!filament) {
            throw new FilamentNotFoundError(id);
        }

        // os pedidos referenciam o filamento por id — excluir quebraria o histórico.
        // já usado: desativa (some da escolha do cliente, histórico intacto).
        // nunca usado: pode ser removido de vez do catálogo.
        const inUse = await this.printRequestRepository.existsByFilamentId(id);
        if (inUse) {
            filament.deactivate();
            await this.filamentRepository.save(filament);
            return;
        }

        await this.filamentRepository.delete(id);
    }
}

namespace DeleteFilamentUseCase {
    export const InputSchema = z.object({
        id: z.string(),
    });

    export const OutputSchema = z.void();

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { DeleteFilamentUseCase };
