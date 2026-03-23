import { UniqueId, UseCase } from "@core/base-classes";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";
import { RoomRepository } from "@booking/domain/repositories";
import { RoomNotFoundError } from "../errors";
import { SpaceOperatingHoursRepository } from "@operating-hours/domain/repositories/space-operating-hours";
import { SpaceOperatingHours } from "@operating-hours/domain/entity";

class GetRoomOperatingScheduleUseCase extends UseCase<GetRoomOperatingScheduleUseCase.Input, GetRoomOperatingScheduleUseCase.Output> {

    constructor(
        private readonly authUserService: AuthUserService,
        private readonly roomRepository: RoomRepository,
        private readonly spaceOperatingHoursRepository: SpaceOperatingHoursRepository
    ) {
        super();
    }

    async execute(input: GetRoomOperatingScheduleUseCase.Input): Promise<GetRoomOperatingScheduleUseCase.Output> {
        this.authUserService.checkIsAdmin();
        const roomId = UniqueId.fromString(input.roomId);

        const room = await this.roomRepository.findById(roomId);
        if (!room) {
            throw new RoomNotFoundError(roomId);
        }

        const schedule = await this.spaceOperatingHoursRepository.findBySpaceId(roomId);
        return schedule?.toJSON() ?? null;
    }
}

namespace GetRoomOperatingScheduleUseCase {
    export const InputSchema = z.object({
        roomId: z.string(),
    });

    export const OutputSchema = SpaceOperatingHours.JsonSchema.nullable();

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { GetRoomOperatingScheduleUseCase };
