import { UniqueId, UseCase } from "@core/base-classes";
import { PrintRequestRepository } from "@printing/domain/repositories";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";
import { PrintRequestNotFoundError } from "../errors";

/**
 * Análise do pedido: aceitar ou recusar (com motivo). O vínculo da
 * impressora acontece depois do aceite, via AllocatePrinterUseCase.
 */
class ProcessPrintRequestUseCase extends UseCase<ProcessPrintRequestUseCase.Input, ProcessPrintRequestUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly printRequestRepository: PrintRequestRepository,
    ) {
        super();
    }

    async execute(params: ProcessPrintRequestUseCase.Input): Promise<ProcessPrintRequestUseCase.Output> {
        this.authUserService.checkIsAdmin();
        const printRequestId = UniqueId.fromString(params.printRequestId);

        const printRequest = await this.printRequestRepository.findById(printRequestId);
        if (!printRequest) {
            throw new PrintRequestNotFoundError(printRequestId);
        }

        if (params.decision.type === "approve") {
            printRequest.approve();
        } else {
            printRequest.reject(params.decision.reason);
        }

        await this.printRequestRepository.save(printRequest);
    }
}

namespace ProcessPrintRequestUseCase {
    export const InputSchema = z.object({
        printRequestId: z.string(),
        decision: z.union([
            z.object({
                type: z.literal("approve"),
            }),
            z.object({
                type: z.literal("reject"),
                // motivo obrigatório é regra de domínio: PrintRequest.reject() valida
                reason: z.string(),
            }),
        ]),
    });

    export const OutputSchema = z.void();

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { ProcessPrintRequestUseCase };
