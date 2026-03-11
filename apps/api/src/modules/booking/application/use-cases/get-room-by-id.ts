import { UniqueId, UseCase } from "@core/base-classes";
import { Room } from "@booking/domain/entities";
import { RoomRepository } from "@booking/domain/repositories";
import z from "zod";
import { AuthUserService } from "src/modules/identity/domain/services";
import { RoomNotFoundError } from "../errors/room-not-found";

class GetRoomByIdUseCase implements UseCase<GetRoomByIdUseCase.Input, GetRoomByIdUseCase.Output> {
    constructor(
        private readonly _: AuthUserService,
        private readonly roomRepository: RoomRepository,
    ) { }

    async execute(params: GetRoomByIdUseCase.Input): Promise<GetRoomByIdUseCase.Output> {
        const roomId = UniqueId.fromString(params.id);
        const room = await this.roomRepository.findById(roomId);

        if (!room) {
            throw new RoomNotFoundError(roomId);
        }

        return room.toJSON();
    }
}

namespace GetRoomByIdUseCase {
    export const InputSchema = z.object({
        id: z.string(),
    });
    export const OutputSchema = Room.JsonSchema;

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { GetRoomByIdUseCase };
