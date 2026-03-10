import { UseCase } from "@core/base-classes";
import { Room } from "@booking/domain/entities";
import { RoomRepository } from "@booking/domain/repositories";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";

class CreateRoomUseCase implements UseCase<CreateRoomUseCase.Input, CreateRoomUseCase.Output> {
    constructor(
        private readonly roomRepository: RoomRepository,
        private readonly authUserService: AuthUserService,
    ) { }

    async execute(input: CreateRoomUseCase.Input): Promise<CreateRoomUseCase.Output> {
        this.authUserService.checkIsAdmin();

        const room = Room.create(input);
        await this.roomRepository.save(room);
        return room.toJSON();
    }
}

namespace CreateRoomUseCase {
    export const InputSchema = Room.CreateSchema;
    export const OutputSchema = Room.JsonSchema;

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { CreateRoomUseCase };