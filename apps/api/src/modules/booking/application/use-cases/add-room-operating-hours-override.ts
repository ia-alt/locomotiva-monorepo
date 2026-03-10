import { RoomRepository } from "@booking/domain/repositories";
import { UniqueId, UseCase } from "@core/base-classes";
import { AuthUserService } from "src/modules/identity/domain/services";
import { OperatingHoursOverride } from "@operating-hours/domain/value-objects";
import z from "zod";
import { RoomNotFoundError } from "../errors";
import { SpaceOperatingHoursService } from "@operating-hours/domain/services";

class AddOperatingHoursOverrideUseCase extends UseCase<AddOperatingHoursOverrideUseCase.Input, AddOperatingHoursOverrideUseCase.Output> {

    constructor(
        private readonly authUserService: AuthUserService,
        private readonly roomRepository: RoomRepository,
        private readonly spaceOperatingHoursService: SpaceOperatingHoursService
    ) {
        super();
    }

    async execute(input: AddOperatingHoursOverrideUseCase.Input): Promise<AddOperatingHoursOverrideUseCase.Output> {
        this.authUserService.checkIsAdmin();
        const roomId = UniqueId.fromString(input.roomId);
        const override = OperatingHoursOverride.fromJSON(input.override);

        const room = await this.roomRepository.findById(roomId);
        if (!room) {
            throw new RoomNotFoundError(roomId);
        }

        await this.spaceOperatingHoursService.addOperatingHoursOverride(roomId, override);
    }
}

namespace AddOperatingHoursOverrideUseCase {
    export const InputSchema = z.object({
        roomId: z.string(),
        override: OperatingHoursOverride.JsonSchema,
    });

    export const OutputSchema = z.void()

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { AddOperatingHoursOverrideUseCase }