import { UniqueId, UseCase } from "@core/base-classes";
import { Printer } from "@printing/domain/entities";
import { PrinterRepository } from "@printing/domain/repositories";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";
import { PrinterNotFoundError } from "../errors";

class UpdatePrinterUseCase extends UseCase<UpdatePrinterUseCase.Input, UpdatePrinterUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly printerRepository: PrinterRepository,
    ) {
        super();
    }

    async execute(input: UpdatePrinterUseCase.Input): Promise<UpdatePrinterUseCase.Output> {
        this.authUserService.checkIsAdmin();
        const printerId = UniqueId.fromString(input.id);

        const printer = await this.printerRepository.findById(printerId);
        if (!printer) {
            throw new PrinterNotFoundError(printerId);
        }

        printer.update(input);
        await this.printerRepository.save(printer);
        return printer.toJSON();
    }
}

namespace UpdatePrinterUseCase {
    export const InputSchema = Printer.UpdateSchema.extend({ id: z.string() });
    export const OutputSchema = Printer.JsonSchema;

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { UpdatePrinterUseCase };
