import { UniqueId, UseCase } from "@core/base-classes";
import { PrintRequestRepository } from "@printing/domain/repositories";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";
import { PrintRequestNotFoundError } from "../errors";

/** A peça pronta não foi retirada e foi descartada (com motivo obrigatório). */
class DiscardPrintRequestUseCase extends UseCase<DiscardPrintRequestUseCase.Input, DiscardPrintRequestUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly printRequestRepository: PrintRequestRepository,
    ) {
        super();
    }

    async execute(params: DiscardPrintRequestUseCase.Input): Promise<DiscardPrintRequestUseCase.Output> {
        this.authUserService.checkIsAdmin();
        const printRequestId = UniqueId.fromString(params.printRequestId);

        const printRequest = await this.printRequestRepository.findById(printRequestId);
        if (!printRequest) {
            throw new PrintRequestNotFoundError(printRequestId);
        }

        printRequest.discard(params.reason);
        await this.printRequestRepository.save(printRequest);
    }
}

namespace DiscardPrintRequestUseCase {
    export const InputSchema = z.object({
        printRequestId: z.string(),
        // motivo obrigatório é regra de domínio: PrintRequest.discard() valida
        reason: z.string(),
    });

    export const OutputSchema = z.void();

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { DiscardPrintRequestUseCase };
