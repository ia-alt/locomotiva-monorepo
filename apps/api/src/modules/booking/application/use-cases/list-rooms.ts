import { UseCase } from "@core/base-classes";
import { Room } from "@booking/domain/entities";
import { RoomRepository } from "@booking/domain/repositories";
import { SpaceOperatingHoursRepository } from "@operating-hours/domain/repositories/space-operating-hours";
import z from "zod";
import { AuthUserService } from "src/modules/identity/domain/services";

class ListRoomsUseCase implements UseCase<ListRoomsUseCase.Input, ListRoomsUseCase.Output> {
    constructor(
        private readonly _: AuthUserService,
        private readonly roomRepository: RoomRepository,
        private readonly spaceOperatingHoursRepository: SpaceOperatingHoursRepository,
    ) { }

    async execute(): Promise<ListRoomsUseCase.Output> {
        const rooms = await this.roomRepository.findAll();
        const spaceIds = rooms.map(r => r.id);
        const schedules = await this.spaceOperatingHoursRepository.findManyBySpaceIds(spaceIds);
        const scheduledRoomIds = new Set(
            schedules
                .filter(s => s.toJSON().policies.length > 0)
                .map(s => s.toJSON().spaceId)
        );

        return rooms.map(room => ({
            ...room.toJSON(),
            hasOperatingSchedule: scheduledRoomIds.has(room.id.value),
        }));
    }
}

namespace ListRoomsUseCase {
    export const InputSchema = z.object();
    export const OutputSchema = z.array(Room.JsonSchema.extend({
        hasOperatingSchedule: z.boolean(),
    }));

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { ListRoomsUseCase };
