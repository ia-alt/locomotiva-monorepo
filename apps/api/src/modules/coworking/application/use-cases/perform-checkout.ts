import { UseCase } from "@core/base-classes";
import { AccessLog } from "@coworking/domain/entities";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";
import { AccessService } from "@coworking/domain/services";

class PerformCheckoutUseCase implements UseCase<PerformCheckoutUseCase.Input, PerformCheckoutUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly accessService: AccessService,
    ) { }

    async execute(_input: PerformCheckoutUseCase.Input): Promise<PerformCheckoutUseCase.Output> {
        const { id: userId } = this.authUserService.getUser();

        const checkin = await this.accessService.checkOutUser(userId);

        return checkin.toJSON();
    }
}

namespace PerformCheckoutUseCase {
    export const InputSchema = z.object({});
    export const OutputSchema = AccessLog.JsonSchema;

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { PerformCheckoutUseCase };
