import { UseCase } from "@core/base-classes";
import { Room } from "@booking/domain/entities";
import { RoomRepository } from "@booking/domain/repositories";
import z from "zod";
import { AuthUserService } from "src/modules/identity/domain/services";

class ListRoomsUseCase implements UseCase<ListRoomsUseCase.Input, ListRoomsUseCase.Output> {
    constructor(
        private readonly _: AuthUserService,
        private readonly roomRepository: RoomRepository,
    ) { }

    async execute(): Promise<ListRoomsUseCase.Output> {
        const rooms = await this.roomRepository.findAll();
        return rooms.map(room => room.toJSON());
    }
}

namespace ListRoomsUseCase {
    export const InputSchema = z.object();
    export const OutputSchema = z.array(Room.JsonSchema);

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { ListRoomsUseCase };