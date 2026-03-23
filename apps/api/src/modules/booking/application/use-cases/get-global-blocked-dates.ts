import { UseCase } from "@core/base-classes";
import { UniqueId } from "@core/base-classes";
import { SpaceOperatingHoursRepository } from "@operating-hours/domain/repositories/space-operating-hours";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";

// Fixed UUID v4 reserved for the global holidays space - must not collide with any real room ID
const GLOBAL_HOLIDAYS_SPACE_ID = "00000000-0000-4000-8000-000000000001";

class GetGlobalBlockedDatesUseCase extends UseCase<GetGlobalBlockedDatesUseCase.Input, GetGlobalBlockedDatesUseCase.Output> {

    constructor(
        private readonly authUserService: AuthUserService,
        private readonly spaceOperatingHoursRepository: SpaceOperatingHoursRepository
    ) {
        super();
    }

    async execute(): Promise<GetGlobalBlockedDatesUseCase.Output> {
        this.authUserService.checkIsAdmin();

        const spaceId = UniqueId.fromString(GLOBAL_HOLIDAYS_SPACE_ID);
        const globalRecord = await this.spaceOperatingHoursRepository.findBySpaceId(spaceId);

        if (!globalRecord) {
            return { dates: [] };
        }

        const json = globalRecord.toJSON();
        const blockedDates = json.overrides
            .filter(o => o.dailyAvailability === null)
            .map(o => o.date);

        return { dates: blockedDates };
    }
}

namespace GetGlobalBlockedDatesUseCase {
    export const InputSchema = z.object();
    export const OutputSchema = z.object({
        dates: z.array(z.string()),
    });

    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { GetGlobalBlockedDatesUseCase, GLOBAL_HOLIDAYS_SPACE_ID };
