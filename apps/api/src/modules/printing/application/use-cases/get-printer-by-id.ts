import { UniqueId, UseCase } from "@core/base-classes";
import { Printer } from "@printing/domain/entities";
import { PrinterRepository } from "@printing/domain/repositories";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";
import { PrinterNotFoundError } from "../errors";

class GetPrinterByIdUseCase extends UseCase<GetPrinterByIdUseCase.Input, GetPrinterByIdUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly printerRepository: PrinterRepository,
    ) {
        super();
    }

    async execute(input: GetPrinterByIdUseCase.Input): Promise<GetPrinterByIdUseCase.Output> {
        this.authUserService.getUser();
        const printerId = UniqueId.fromString(input.id);

        const printer = await this.printerRepository.findById(printerId);
        if (!printer) {
            throw new PrinterNotFoundError(printerId);
        }

        return printer.toJSON();
    }
}

namespace GetPrinterByIdUseCase {
    export const InputSchema = z.object({
        id: z.string(),
    });

    export const OutputSchema = Printer.JsonSchema;

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { GetPrinterByIdUseCase };
