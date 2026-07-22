import { UseCase } from "@core/base-classes";
import { Printer } from "@printing/domain/entities";
import { PrinterRepository } from "@printing/domain/repositories";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";

class CreatePrinterUseCase extends UseCase<CreatePrinterUseCase.Input, CreatePrinterUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly printerRepository: PrinterRepository,
    ) {
        super();
    }

    async execute(input: CreatePrinterUseCase.Input): Promise<CreatePrinterUseCase.Output> {
        this.authUserService.checkIsAdmin();

        const printer = Printer.create(input);
        await this.printerRepository.save(printer);
        return printer.toJSON();
    }
}

namespace CreatePrinterUseCase {
    export const InputSchema = Printer.CreateSchema;
    export const OutputSchema = Printer.JsonSchema;

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { CreatePrinterUseCase };
