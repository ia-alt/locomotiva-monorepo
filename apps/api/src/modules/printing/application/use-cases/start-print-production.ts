import { UniqueId, UseCase } from "@core/base-classes";
import { PrintRequestRepository, PrinterRepository } from "@printing/domain/repositories";
import { PrintRequestService } from "@printing/domain/services";
import { PrinterNotAllocatedError, PrinterDisabledError } from "@printing/domain/errors";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";
import { PrintRequestNotFoundError, PrinterNotFoundError } from "../errors";

class StartPrintProductionUseCase extends UseCase<StartPrintProductionUseCase.Input, StartPrintProductionUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly printRequestRepository: PrintRequestRepository,
        private readonly printerRepository: PrinterRepository,
        private readonly printRequestService: PrintRequestService,
    ) {
        super();
    }

    async execute(params: StartPrintProductionUseCase.Input): Promise<StartPrintProductionUseCase.Output> {
        this.authUserService.checkIsAdmin();
        const printRequestId = UniqueId.fromString(params.printRequestId);

        const printRequest = await this.printRequestRepository.findById(printRequestId);
        if (!printRequest) {
            throw new PrintRequestNotFoundError(printRequestId);
        }

        const printerId = printRequest.printerId;
        if (!printerId) {
            throw new PrinterNotAllocatedError();
        }

        // a impressora vinculada precisa ainda existir e estar ativa
        const printer = await this.printerRepository.findById(printerId);
        if (!printer) {
            throw new PrinterNotFoundError(printerId);
        }
        if (!printer.enabled) {
            throw new PrinterDisabledError();
        }

        await this.printRequestService.checkPrinterIsFree(printerId, printRequest.id);

        printRequest.startProduction();
        await this.printRequestRepository.save(printRequest);
    }
}

namespace StartPrintProductionUseCase {
    export const InputSchema = z.object({
        printRequestId: z.string(),
    });

    export const OutputSchema = z.void();

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { StartPrintProductionUseCase };
