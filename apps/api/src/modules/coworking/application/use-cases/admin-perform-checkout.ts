import { UseCase, UniqueId } from "@core/base-classes";
import { AccessLog } from "@coworking/domain/entities";
import { AccessLogRepository } from "@coworking/domain/repositories";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";
import { AccessService } from "@coworking/domain/services";

class AdminPerformCheckoutUseCase implements UseCase<AdminPerformCheckoutUseCase.Input, AdminPerformCheckoutUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly accessService: AccessService,
    ) { }

    async execute(input: AdminPerformCheckoutUseCase.Input): Promise<AdminPerformCheckoutUseCase.Output> {
        this.authUserService.checkIsAdmin();

        const userId = UniqueId.fromString(input.userId);

        const accessLog = await this.accessService.checkOutUser(userId);

        return accessLog.toJSON();
    }
}

namespace AdminPerformCheckoutUseCase {
    export const InputSchema = z.object({
        userId: z.string(),
    });
    export const OutputSchema = AccessLog.JsonSchema;

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { AdminPerformCheckoutUseCase };
