import { UniqueId, UseCase } from "@core/base-classes";
import { PrinterRepository, PrintRequestRepository } from "@printing/domain/repositories";
import { PrinterHasActiveRequestsError } from "@printing/domain/errors";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";
import { PrinterNotFoundError } from "../errors";

class DeletePrinterUseCase extends UseCase<DeletePrinterUseCase.Input, DeletePrinterUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly printerRepository: PrinterRepository,
        private readonly printRequestRepository: PrintRequestRepository,
    ) {
        super();
    }

    async execute(input: DeletePrinterUseCase.Input): Promise<DeletePrinterUseCase.Output> {
        this.authUserService.checkIsAdmin();
        const printerId = UniqueId.fromString(input.id);

        const printer = await this.printerRepository.findById(printerId);
        if (!printer) {
            throw new PrinterNotFoundError(printerId);
        }

        // não deixar pedidos aprovados/em produção órfãos de impressora
        const hasActive = await this.printRequestRepository.existsActiveByPrinter(printerId);
        if (hasActive) {
            throw new PrinterHasActiveRequestsError();
        }

        await this.printerRepository.delete(printerId);
    }
}

namespace DeletePrinterUseCase {
    export const InputSchema = z.object({
        id: z.string(),
    });

    export const OutputSchema = z.void();

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { DeletePrinterUseCase };
