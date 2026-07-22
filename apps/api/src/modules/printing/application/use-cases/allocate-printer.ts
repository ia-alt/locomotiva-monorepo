import { UniqueId, UseCase } from "@core/base-classes";
import { PrintRequest } from "@printing/domain/entities";
import { PrintRequestRepository, PrinterRepository } from "@printing/domain/repositories";
import { PrintRequestService } from "@printing/domain/services";
import { PrinterDisabledError } from "@printing/domain/errors";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";
import { PrintRequestNotFoundError, PrinterNotFoundError } from "../errors";

/**
 * Vincula (ou troca) a impressora de um pedido já aceito. Editável até a
 * finalização — o técnico decide quando iniciar, sem agendamento por data.
 */
class AllocatePrinterUseCase extends UseCase<AllocatePrinterUseCase.Input, AllocatePrinterUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly printRequestRepository: PrintRequestRepository,
        private readonly printerRepository: PrinterRepository,
        private readonly printRequestService: PrintRequestService,
    ) {
        super();
    }

    async execute(params: AllocatePrinterUseCase.Input): Promise<AllocatePrinterUseCase.Output> {
        this.authUserService.checkIsAdmin();
        const printRequestId = UniqueId.fromString(params.printRequestId);
        const printerId = UniqueId.fromString(params.printerId);

        const printRequest = await this.printRequestRepository.findById(printRequestId);
        if (!printRequest) {
            throw new PrintRequestNotFoundError(printRequestId);
        }

        const printer = await this.printerRepository.findById(printerId);
        if (!printer) {
            throw new PrinterNotFoundError(printerId);
        }
        if (!printer.enabled) {
            throw new PrinterDisabledError();
        }

        // Pré-alocar num pedido APROVADO é livre (a fila é decidida pelo técnico);
        // só a TROCA durante a produção exige a impressora de destino livre.
        if (printRequest.currentStatus === PrintRequest.Status.IN_PRODUCTION) {
            await this.printRequestService.checkPrinterIsFree(printerId, printRequest.id);
        }

        printRequest.allocatePrinter(printerId);
        await this.printRequestRepository.save(printRequest);
    }
}

namespace AllocatePrinterUseCase {
    export const InputSchema = z.object({
        printRequestId: z.string(),
        printerId: z.string(),
    });

    export const OutputSchema = z.void();

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { AllocatePrinterUseCase };
