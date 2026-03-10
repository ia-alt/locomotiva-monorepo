import { UseCase, UniqueId } from "@core/base-classes";
import { AccessLog } from "@coworking/domain/entities";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";
import { AccessService } from "@coworking/domain/services";

class AdminPerformCheckinUseCase implements UseCase<AdminPerformCheckinUseCase.Input, AdminPerformCheckinUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly accessService: AccessService,
    ) { }

    async execute(input: AdminPerformCheckinUseCase.Input): Promise<AdminPerformCheckinUseCase.Output> {
        this.authUserService.checkIsAdmin();

        const userId = UniqueId.fromString(input.userId);

        const accessLog = await this.accessService.checkInUser(userId);

        return accessLog.toJSON();
    }
}

namespace AdminPerformCheckinUseCase {
    export const InputSchema = z.object({
        userId: z.string(),
    });

    export const OutputSchema = AccessLog.JsonSchema;

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { AdminPerformCheckinUseCase };
