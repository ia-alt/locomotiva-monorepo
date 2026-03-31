import { UseCase } from "@core/base-classes";
import { AccessLog } from "@coworking/domain/entities";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";
import { AccessService } from "@coworking/domain/services";

class PerformCheckinUseCase implements UseCase<PerformCheckinUseCase.Input, PerformCheckinUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly accessService: AccessService,
    ) { }

    async execute(input: PerformCheckinUseCase.Input): Promise<PerformCheckinUseCase.Output> {
        const { id: userId } = this.authUserService.getUser();
        const totemName = input.totemName;
        const checkin = await this.accessService.checkInUser(userId, totemName);

        return checkin.toJSON();
    }
}

namespace PerformCheckinUseCase {
    export const InputSchema = z.object({
        totemName: z.string().nullable(),
    });
    export const OutputSchema = AccessLog.JsonSchema;

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { PerformCheckinUseCase };
