import { UniqueId, UseCase } from "@core/base-classes";
import { PrinterRepository } from "@printing/domain/repositories";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";
import { PrinterNotFoundError } from "../errors";

class SetPrinterEnabledUseCase extends UseCase<SetPrinterEnabledUseCase.Input, SetPrinterEnabledUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly printerRepository: PrinterRepository,
    ) {
        super();
    }

    async execute(input: SetPrinterEnabledUseCase.Input): Promise<SetPrinterEnabledUseCase.Output> {
        this.authUserService.checkIsAdmin();
        const printerId = UniqueId.fromString(input.id);

        const printer = await this.printerRepository.findById(printerId);
        if (!printer) {
            throw new PrinterNotFoundError(printerId);
        }

        printer.setEnabled(input.enabled);
        await this.printerRepository.save(printer);
    }
}

namespace SetPrinterEnabledUseCase {
    export const InputSchema = z.object({
        id: z.string(),
        enabled: z.boolean(),
    });

    export const OutputSchema = z.void();

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { SetPrinterEnabledUseCase };
