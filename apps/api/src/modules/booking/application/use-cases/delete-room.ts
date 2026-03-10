import { UniqueId, UseCase } from "@core/base-classes";
import { RoomRepository } from "@booking/domain/repositories";
import z from "zod";
import { AuthUserService } from "src/modules/identity/domain/services";
import { RoomNotFoundError } from "../errors";

class DeleteRoomUseCase implements UseCase<DeleteRoomUseCase.Input, DeleteRoomUseCase.Output> {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly roomRepository: RoomRepository,
    ) { }

    async execute(input: DeleteRoomUseCase.Input): Promise<DeleteRoomUseCase.Output> {
        this.authUserService.checkIsAdmin();

        const roomId = UniqueId.fromString(input.roomId);
        const room = await this.roomRepository.findById(roomId);
        if (!room) {
            throw new RoomNotFoundError(roomId);
        }

        await this.roomRepository.delete(roomId);
    }
}

namespace DeleteRoomUseCase {
    export const InputSchema = z.object({
        roomId: z.string(),
    });
    export const OutputSchema = z.void();

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { DeleteRoomUseCase };
