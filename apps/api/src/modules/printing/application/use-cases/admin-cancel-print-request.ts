import { UniqueId, UseCase } from "@core/base-classes";
import { PrintRequestRepository } from "@printing/domain/repositories";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";
import { PrintRequestNotFoundError } from "../errors";

class AdminCancelPrintRequestUseCase extends UseCase<AdminCancelPrintRequestUseCase.Input, AdminCancelPrintRequestUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly printRequestRepository: PrintRequestRepository,
    ) {
        super();
    }

    async execute(params: AdminCancelPrintRequestUseCase.Input): Promise<AdminCancelPrintRequestUseCase.Output> {
        this.authUserService.checkIsAdmin();
        const printRequestId = UniqueId.fromString(params.printRequestId);

        const printRequest = await this.printRequestRepository.findById(printRequestId);
        if (!printRequest) {
            throw new PrintRequestNotFoundError(printRequestId);
        }

        printRequest.adminCancel(params.reason);

        await this.printRequestRepository.save(printRequest);
    }
}

namespace AdminCancelPrintRequestUseCase {
    export const InputSchema = z.object({
        printRequestId: z.string(),
        reason: z.string(),
    });

    export const OutputSchema = z.void();

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { AdminCancelPrintRequestUseCase };
