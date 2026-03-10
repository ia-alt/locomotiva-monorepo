import { SpaceOperatingHoursRepository } from "@operating-hours/domain/repositories/space-operating-hours";
import { SpaceOperatingHours } from "@operating-hours/domain/entity";
import { PrismaClient, Prisma, SpaceOperatingHours as SpaceOperatingHoursDb } from "@core/infra/database/prisma";
import { UniqueId } from "@core/base-classes";
import { OperatingHoursPolicy, OperatingHoursOverride } from "@operating-hours/domain/value-objects";

export class PrismaSpaceOperatingHoursRepository implements SpaceOperatingHoursRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async save(spaceOperatingHours: SpaceOperatingHours): Promise<void> {
        const json = spaceOperatingHours.toJSON();

        await this.prisma.spaceOperatingHours.upsert({
            where: { spaceId: json.spaceId },
            update: {
                policies: json.policies as Prisma.InputJsonValue,
                overrides: json.overrides as Prisma.InputJsonValue
            },
            create: {
                spaceId: json.spaceId,
                policies: json.policies as Prisma.InputJsonValue,
                overrides: json.overrides as Prisma.InputJsonValue
            }
        });
    }

    async findBySpaceId(spaceId: UniqueId): Promise<SpaceOperatingHours | null> {
        const dbModel = await this.prisma.spaceOperatingHours.findUnique({
            where: { spaceId: spaceId.value }
        });

        if (!dbModel) return null;

        return this.mapToEntity(dbModel);
    }

    async findManyBySpaceIds(spaceIds: UniqueId[]): Promise<SpaceOperatingHours[]> {
        const dbModels = await this.prisma.spaceOperatingHours.findMany({
            where: {
                spaceId: { in: spaceIds.map(id => id.value) }
            }
        });

        return dbModels.map(model => this.mapToEntity(model));
    }

    private mapToEntity(dbModel: SpaceOperatingHoursDb): SpaceOperatingHours {
        // Prisma Json type needs to be cast to the expected type
        // We trust the data in the DB matches our schema
        const policiesJson = dbModel.policies as unknown as OperatingHoursPolicy.Json[];
        const overridesJson = dbModel.overrides as unknown as OperatingHoursOverride.Json[];

        return SpaceOperatingHours.fromJSON({
            spaceId: dbModel.spaceId,
            policies: policiesJson,
            overrides: overridesJson
        });
    }
}
