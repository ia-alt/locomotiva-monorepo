import { UseCase } from "@core/base-classes";
import { AccessLogRepository } from "@coworking/domain/repositories";
import { AccessLog } from "@coworking/domain/entities";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";

class GetMyCheckinStatusUseCase implements UseCase<GetMyCheckinStatusUseCase.Input, GetMyCheckinStatusUseCase.Output> {
    constructor(
        private readonly accessLogRepository: AccessLogRepository,
        private readonly authUserService: AuthUserService,
    ) { }

    async execute(_input: GetMyCheckinStatusUseCase.Input): Promise<GetMyCheckinStatusUseCase.Output> {
        const { id: userId } = this.authUserService.getUser();

        const activeLog = await this.accessLogRepository.findByUserIdAndActive(userId);

        if (!activeLog) {
            return null;
        }

        return activeLog.toJSON();
    }
}

namespace GetMyCheckinStatusUseCase {
    export const InputSchema = z.object({});

    export const OutputSchema = AccessLog.JsonSchema.nullable();

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { GetMyCheckinStatusUseCase };
