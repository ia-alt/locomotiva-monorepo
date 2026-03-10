import { UseCase } from "@core/base-classes";
import { AccessLogRepository } from "@coworking/domain/repositories";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";

class CountActiveAccessLogsUseCase implements UseCase<CountActiveAccessLogsUseCase.Input, CountActiveAccessLogsUseCase.Output> {
    constructor(
        private readonly checkinRepository: AccessLogRepository,
        private readonly authUserService: AuthUserService,
    ) { }

    async execute(): Promise<CountActiveAccessLogsUseCase.Output> {
        this.authUserService.checkIsAdmin();

        const activeLogs = await this.checkinRepository.findAllActive();

        return {
            count: activeLogs.length
        };
    }
}

namespace CountActiveAccessLogsUseCase {
    export const InputSchema = z.object({});

    export const OutputSchema = z.object({
        count: z.number()
    });

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { CountActiveAccessLogsUseCase };
