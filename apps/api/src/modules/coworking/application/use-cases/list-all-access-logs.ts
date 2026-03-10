import { UseCase } from "@core/base-classes";
import { AccessLogRepository } from "@coworking/domain/repositories";
import { AccessLog } from "@coworking/domain/entities";
import { PaginatedQuery, PaginatedResult } from "@core/value-objects";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";

class ListAllAccessLogsUseCase implements UseCase<ListAllAccessLogsUseCase.Input, ListAllAccessLogsUseCase.Output> {
    constructor(
        private readonly checkinRepository: AccessLogRepository,
        private readonly authUserService: AuthUserService,
    ) { }

    async execute(input: ListAllAccessLogsUseCase.Input): Promise<ListAllAccessLogsUseCase.Output> {
        this.authUserService.checkIsAdmin();

        const paginatedQuery = PaginatedQuery.create(input);

        const paginatedResult = await this.checkinRepository.findAllHistory(paginatedQuery);

        return paginatedResult.toJSON();
    }
}

namespace ListAllAccessLogsUseCase {
    export const InputSchema = PaginatedQuery.Schema;

    export const OutputSchema = PaginatedResult.JsonSchema(AccessLog.JsonSchema);

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { ListAllAccessLogsUseCase };
