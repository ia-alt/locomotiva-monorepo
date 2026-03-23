import { UseCase } from "@core/base-classes";
import { UniqueId } from "@core/base-classes";
import { SpaceOperatingHoursRepository } from "@operating-hours/domain/repositories/space-operating-hours";
import { SpaceOperatingHoursService } from "@operating-hours/domain/services";
import { OperatingHoursOverride } from "@operating-hours/domain/value-objects";
import { OnlyDate } from "@core/value-objects";
import { SpaceOperatingHours } from "@operating-hours/domain/entity";
import { RoomRepository } from "@booking/domain/repositories";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";
import { GLOBAL_HOLIDAYS_SPACE_ID } from "./get-global-blocked-dates";

class SetGlobalBlockedDatesUseCase extends UseCase<SetGlobalBlockedDatesUseCase.Input, SetGlobalBlockedDatesUseCase.Output> {

    constructor(
        private readonly authUserService: AuthUserService,
        private readonly roomRepository: RoomRepository,
        private readonly spaceOperatingHoursService: SpaceOperatingHoursService,
        private readonly spaceOperatingHoursRepository: SpaceOperatingHoursRepository
    ) {
        super();
    }

    async execute(input: SetGlobalBlockedDatesUseCase.Input): Promise<SetGlobalBlockedDatesUseCase.Output> {
        this.authUserService.checkIsAdmin();

        const overrides = input.dates.map(dateStr => {
            return OperatingHoursOverride.fromJSON({
                date: dateStr,
                dailyAvailability: null,
            });
        });

        // Save global record (for reading back later)
        const globalSpaceId = UniqueId.fromString(GLOBAL_HOLIDAYS_SPACE_ID);
        const globalRecord = SpaceOperatingHours.create(globalSpaceId);
        for (const override of overrides) {
            globalRecord.addOverride(override);
        }
        await this.spaceOperatingHoursRepository.save(globalRecord);

        // Apply overrides to all rooms
        const rooms = await this.roomRepository.findAll();
        for (const room of rooms) {
            for (const override of overrides) {
                await this.spaceOperatingHoursService.addOperatingHoursOverride(room.id, override);
            }
        }
    }
}

namespace SetGlobalBlockedDatesUseCase {
    export const InputSchema = z.object({
        dates: z.array(z.string()),
    });
    export const OutputSchema = z.void();

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { SetGlobalBlockedDatesUseCase };
