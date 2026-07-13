import { FilamentRepository } from "@printing/domain/repositories";
import { Filament } from "@printing/domain/entities";
import { UniqueId } from "@core/base-classes";
import { PrismaClient, Filament as FilamentDb } from "@core/infra/database/prisma";

export class PrismaFilamentRepository implements FilamentRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async save(filament: Filament): Promise<void> {
        const data = filament.toJSON();
        await this.prisma.filament.upsert({
            where: { id: data.id },
            update: { name: data.name },
            create: { id: data.id, name: data.name },
        });
    }

    async findAll(): Promise<Filament[]> {
        const rows = await this.prisma.filament.findMany({ orderBy: { name: "asc" } });
        return rows.map((row) => this.filamentDbToEntity(row));
    }

    async findById(id: UniqueId): Promise<Filament | null> {
        const row = await this.prisma.filament.findUnique({ where: { id: id.value } });
        if (!row) return null;
        return this.filamentDbToEntity(row);
    }

    async findByName(name: string): Promise<Filament | null> {
        const row = await this.prisma.filament.findFirst({
            where: { name: { equals: name.trim(), mode: "insensitive" } },
        });
        if (!row) return null;
        return this.filamentDbToEntity(row);
    }

    async delete(id: UniqueId): Promise<void> {
        await this.prisma.filament.delete({ where: { id: id.value } });
    }

    private filamentDbToEntity(row: FilamentDb): Filament {
        return new Filament(UniqueId.fromString(row.id), row.name);
    }
}
