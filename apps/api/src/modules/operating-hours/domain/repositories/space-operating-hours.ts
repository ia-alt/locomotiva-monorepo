import { SpaceOperatingHours } from "../entity";
import { UniqueId } from "@core/base-classes";

export interface SpaceOperatingHoursRepository {
    save(spaceOperatingHours: SpaceOperatingHours): Promise<void>;
    findBySpaceId(spaceId: UniqueId): Promise<SpaceOperatingHours | null>;
    findManyBySpaceIds(spaceIds: UniqueId[]): Promise<SpaceOperatingHours[]>;
}

