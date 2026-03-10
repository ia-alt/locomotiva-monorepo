import { UniqueId, UseCase } from "@core/base-classes";
import { Room } from "@booking/domain/entities";
import { RoomRepository } from "@booking/domain/repositories";
import z from "zod";
import { AuthUserService } from "src/modules/identity/domain/services";
import { RoomNotFoundError } from "../errors";

class SetRoomEnabledUseCase implements UseCase<SetRoomEnabledUseCase.Input, SetRoomEnabledUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly roomRepository: RoomRepository,
    ) { }

    async execute(input: SetRoomEnabledUseCase.Input): Promise<SetRoomEnabledUseCase.Output> {
        this.authUserService.checkIsAdmin();

        const roomId = UniqueId.fromString(input.roomId);
        const room = await this.roomRepository.findById(roomId);
        if (!room) {
            throw new RoomNotFoundError(roomId);
        }

        room.setEnabled(input.enabled);
        await this.roomRepository.save(room);
        return room.toJSON();
    }
}

namespace SetRoomEnabledUseCase {
    export const InputSchema = z.object({
        roomId: z.string(),
        enabled: z.boolean(),
    });
    export const OutputSchema = Room.JsonSchema;

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { SetRoomEnabledUseCase };
