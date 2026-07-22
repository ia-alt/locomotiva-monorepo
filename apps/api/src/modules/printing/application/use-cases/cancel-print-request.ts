import { UniqueId, UseCase } from "@core/base-classes";
import { PrintRequestRepository } from "@printing/domain/repositories";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";
import { PrintRequestNotFoundError } from "../errors";

class CancelPrintRequestUseCase extends UseCase<CancelPrintRequestUseCase.Input, CancelPrintRequestUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly printRequestRepository: PrintRequestRepository,
    ) {
        super();
    }

    async execute(params: CancelPrintRequestUseCase.Input): Promise<CancelPrintRequestUseCase.Output> {
        const user = this.authUserService.getUser();
        const printRequestId = UniqueId.fromString(params.printRequestId);

        const printRequest = await this.printRequestRepository.findById(printRequestId);
        if (!printRequest) {
            throw new PrintRequestNotFoundError(printRequestId);
        }

        printRequest.cancel(user.id);

        await this.printRequestRepository.save(printRequest);
    }
}

namespace CancelPrintRequestUseCase {
    export const InputSchema = z.object({
        printRequestId: z.string(),
    });

    export const OutputSchema = z.void();

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { CancelPrintRequestUseCase };
