import { PrintRequest } from "@printing/domain/entities";
import { PrintRequestRepository } from "@printing/domain/repositories";
import { UseCase } from "@core/base-classes";
import { PaginatedQuery, PaginatedResult } from "@core/value-objects";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";

class FindMyPrintRequestsUseCase extends UseCase<FindMyPrintRequestsUseCase.Input, FindMyPrintRequestsUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly printRequestRepository: PrintRequestRepository,
    ) {
        super();
    }

    async execute(params: FindMyPrintRequestsUseCase.Input): Promise<FindMyPrintRequestsUseCase.Output> {
        const user = this.authUserService.getUser();

        const result = await this.printRequestRepository.findMany({
            pagination: PaginatedQuery.create(params.pagination),
            filter: {
                usersIds: [user.id],
                status: params.status,
            }
        });

        return result.toJSON();
    }
}

namespace FindMyPrintRequestsUseCase {
    export const InputSchema = z.object({
        pagination: PaginatedQuery.Schema,
        status: z.array(PrintRequest.StatusSchema).optional(),
    });

    export const OutputSchema = PaginatedResult.JsonSchema(PrintRequest.JsonSchema);

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { FindMyPrintRequestsUseCase };
