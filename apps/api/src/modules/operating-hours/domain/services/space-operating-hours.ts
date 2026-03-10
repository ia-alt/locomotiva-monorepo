import { UniqueId } from "@core/base-classes";
import { SpaceOperatingHoursRepository } from "../repositories/space-operating-hours";
import { OnlyDate } from "@core/value-objects";
import { DailyAvailability, OperatingHoursOverride, OperatingHoursPolicy } from "../value-objects";
import { SpaceOperatingHours } from "../entity";

export class SpaceOperatingHoursService {

    constructor(
        private readonly spaceOperatingHoursRepository: SpaceOperatingHoursRepository
    ) { }

    async addOperatingHoursOverride(spaceId: UniqueId, override: OperatingHoursOverride) {
        let spaceOperatingHours = await this.spaceOperatingHoursRepository.findBySpaceId(spaceId);
        if (!spaceOperatingHours) {
            spaceOperatingHours = SpaceOperatingHours.create(spaceId);
        }

        spaceOperatingHours.addOverride(override);

        await this.spaceOperatingHoursRepository.save(spaceOperatingHours);
    }

    async setDefaultOperatingHours(spaceId: UniqueId, policy: OperatingHoursPolicy) {
        let spaceOperatingHours = await this.spaceOperatingHoursRepository.findBySpaceId(spaceId);
        if (!spaceOperatingHours) {
            spaceOperatingHours = SpaceOperatingHours.create(spaceId);
        }

        spaceOperatingHours.addPolicy(policy);

        await this.spaceOperatingHoursRepository.save(spaceOperatingHours);
    }

    async getAvailabilityForDay(spaceId: UniqueId, date: OnlyDate): Promise<DailyAvailability | null> {
        const spaceOperatingHours = await this.spaceOperatingHoursRepository.findBySpaceId(spaceId);
        if (!spaceOperatingHours) {
            return null;
        }
        return spaceOperatingHours.getAvailabilityForDay(date);
    }
}