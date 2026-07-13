import { UseCase } from "@core/base-classes";
import { Printer } from "@printing/domain/entities";
import { PrinterRepository, PrintRequestRepository } from "@printing/domain/repositories";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";

class ListPrintersUseCase extends UseCase<ListPrintersUseCase.Input, ListPrintersUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly printerRepository: PrinterRepository,
        private readonly printRequestRepository: PrintRequestRepository,
    ) {
        super();
    }

    async execute(): Promise<ListPrintersUseCase.Output> {
        const user = this.authUserService.getUser();

        // admin enxerga todas (inclusive desabilitadas) para o CRUD; cliente, só as habilitadas
        const printers = user.isAdmin()
            ? await this.printerRepository.findAll()
            : await this.printerRepository.findAllEnabled();

        // marca como "em uso" as impressoras com um pedido EM PRODUÇÃO
        const inProduction = await this.printRequestRepository.findAllInProduction();
        const busyPrinterIds = new Set(
            inProduction.map((pr) => pr.printerId?.value).filter((x): x is string => !!x),
        );

        return printers.map((printer) => ({
            ...printer.toJSON(),
            inUse: busyPrinterIds.has(printer.id.value),
        }));
    }
}

namespace ListPrintersUseCase {
    export const InputSchema = z.object();
    export const OutputSchema = z.array(Printer.JsonSchema.extend({ inUse: z.boolean() }));

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { ListPrintersUseCase };
