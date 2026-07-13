import { UseCase } from "@core/base-classes";
import { PrintRequestRepository } from "@printing/domain/repositories";
import { PaginatedQuery, PaginatedResult } from "@core/value-objects";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";

class FindPrintRequestsAdminUseCase extends UseCase<FindPrintRequestsAdminUseCase.Input, FindPrintRequestsAdminUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly printRequestRepository: PrintRequestRepository,
    ) {
        super();
    }

    async execute(params: FindPrintRequestsAdminUseCase.Input): Promise<FindPrintRequestsAdminUseCase.Output> {
        this.authUserService.checkIsAdmin();

        const result = await this.printRequestRepository.findAllAdmin({
            pagination: PaginatedQuery.create(params.pagination),
            filter: params.filter,
        });

        return result.toJSON();
    }
}

namespace FindPrintRequestsAdminUseCase {
    const FilterSchema = z.object({
        status: z.array(z.string()).optional(),
        printerId: z.string().optional(),
        search: z.string().optional(),
    });

    export const InputSchema = z.object({
        pagination: PaginatedQuery.Schema,
        filter: FilterSchema.optional(),
    });

    export const OutputSchema = PaginatedResult.JsonSchema(PrintRequestRepository.AdminItemSchema);

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { FindPrintRequestsAdminUseCase };
