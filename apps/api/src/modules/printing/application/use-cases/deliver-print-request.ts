import { UniqueId, UseCase } from "@core/base-classes";
import { PrintRequestRepository } from "@printing/domain/repositories";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";
import { PrintRequestNotFoundError } from "../errors";

/** O usuário retirou a peça pronta — encerra o ciclo do pedido. */
class DeliverPrintRequestUseCase extends UseCase<DeliverPrintRequestUseCase.Input, DeliverPrintRequestUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly printRequestRepository: PrintRequestRepository,
    ) {
        super();
    }

    async execute(params: DeliverPrintRequestUseCase.Input): Promise<DeliverPrintRequestUseCase.Output> {
        this.authUserService.checkIsAdmin();
        const printRequestId = UniqueId.fromString(params.printRequestId);

        const printRequest = await this.printRequestRepository.findById(printRequestId);
        if (!printRequest) {
            throw new PrintRequestNotFoundError(printRequestId);
        }

        printRequest.deliver();
        await this.printRequestRepository.save(printRequest);
    }
}

namespace DeliverPrintRequestUseCase {
    export const InputSchema = z.object({
        printRequestId: z.string(),
    });

    export const OutputSchema = z.void();

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { DeliverPrintRequestUseCase };
