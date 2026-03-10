import { UniqueId, UseCase } from "@core/base-classes";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";
import { RoomRepository } from "@booking/domain/repositories";
import { RoomNotFoundError } from "../errors";
import { OperatingHoursPolicy } from "@operating-hours/domain/value-objects";
import { SpaceOperatingHoursService } from "@operating-hours/domain/services";

class SetDefaultOperatingScheduleUseCase extends UseCase<SetDefaultOperatingScheduleUseCase.Input, SetDefaultOperatingScheduleUseCase.Output> {

    constructor(
        private readonly authUserService: AuthUserService,
        private readonly roomRepository: RoomRepository,
        private readonly spaceOperatingHoursService: SpaceOperatingHoursService
    ) {
        super();
    }

    async execute(input: SetDefaultOperatingScheduleUseCase.Input): Promise<SetDefaultOperatingScheduleUseCase.Output> {
        this.authUserService.checkIsAdmin();
        const roomId = UniqueId.fromString(input.roomId);
        const policy = OperatingHoursPolicy.fromJSON(input.policy);

        const room = await this.roomRepository.findById(roomId);
        if (!room) {
            throw new RoomNotFoundError(roomId);
        }

        await this.spaceOperatingHoursService.setDefaultOperatingHours(roomId, policy);
    }
}

namespace SetDefaultOperatingScheduleUseCase {
    export const InputSchema = z.object({
        roomId: z.string(),
        policy: OperatingHoursPolicy.JsonSchema,
    });

    export const OutputSchema = z.void()

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { SetDefaultOperatingScheduleUseCase }