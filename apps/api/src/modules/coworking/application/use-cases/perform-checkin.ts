import { UniqueId, UseCase } from "@core/base-classes";
import { AccessLog } from "@coworking/domain/entities";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";
import { AccessService } from "@coworking/domain/services";
import { TotemCheckinAccessCodeManager } from "../services/totem-checkin-access-code-manager";

class PerformCheckinUseCase implements UseCase<PerformCheckinUseCase.Input, PerformCheckinUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly accessService: AccessService,
        private readonly totemCheckinAccessCodeManager: TotemCheckinAccessCodeManager
    ) { }

    async execute(input: PerformCheckinUseCase.Input): Promise<PerformCheckinUseCase.Output> {
        const { id: userId } = this.authUserService.getUser();
        const accessCode = input.accessCode;
        const apiKey = await this.totemCheckinAccessCodeManager.validateAccessCode(accessCode);
        if (!apiKey) {
            throw new Error("Escaneie novamente totem para realizar o check-in");
        }
        const totemId = apiKey.id;
        const checkin = await this.accessService.checkInUser(userId, totemId);

        return checkin.toJSON();
    }
}

namespace PerformCheckinUseCase {
    export const InputSchema = z.object({
        accessCode: z.string(),
    });
    export const OutputSchema = AccessLog.JsonSchema;

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { PerformCheckinUseCase };
