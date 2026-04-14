import { CoworkingSettingsRepository } from "@coworking/domain/repositories";
import { CoworkingSettings } from "@coworking/domain/entities";
import { PrismaClient, CoworkingSettings as CoworkingSettingsDb } from "@core/infra/database/prisma";
import { UniqueId } from "@core/base-classes";

export class PrismaCoworkingSettingsRepository implements CoworkingSettingsRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async save(coworking: CoworkingSettings): Promise<void> {
        const json = coworking.toJSON();
        await this.prisma.coworkingSettings.upsert({
            where: { id: json.id },
            update: {
                capacity: json.maxCapacity,
            },
            create: {
                id: json.id,
                capacity: json.maxCapacity,
            },
        })
    }

    async get(): Promise<CoworkingSettings> {
        let coworkingSettingsFound = await this.prisma.coworkingSettings.findFirst();
        if (!coworkingSettingsFound) {
            const createdId = UniqueId.create();
            const defaultCapacity = 40;
            coworkingSettingsFound = await this.prisma.coworkingSettings.create({
                data: {
                    id: createdId.value,
                    capacity: defaultCapacity,
                },
            });
        }

        return this.coworkingSettingsDbToEntity(coworkingSettingsFound);
    }

    coworkingSettingsDbToEntity(db: CoworkingSettingsDb): CoworkingSettings {
        return new CoworkingSettings(
            UniqueId.fromString(db.id),
            db.capacity,
        );
    }


}
