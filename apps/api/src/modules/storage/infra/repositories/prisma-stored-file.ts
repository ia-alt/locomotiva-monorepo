import { StoredFileRepository } from "@storage/domain/repositories";
import { StoredFile } from "@storage/domain/entities";
import { UniqueId } from "@core/base-classes";
import { PrismaClient, File as FileDb } from "@core/infra/database/prisma";

export class PrismaStoredFileRepository implements StoredFileRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async save(file: StoredFile): Promise<void> {
        const payload = {
            name: file.name,
            path: file.path,
            sizeBytes: file.sizeBytes,
            deleted: file.deleted,
            uploadedByUserId: file.uploadedByUserId.value,
            createdAt: file.createdAt,
            updatedAt: file.updatedAt,
        };

        await this.prisma.file.upsert({
            where: { id: file.id.value },
            update: payload,
            create: { id: file.id.value, ...payload },
        });
    }

    async findById(id: UniqueId): Promise<StoredFile | null> {
        const row = await this.prisma.file.findUnique({ where: { id: id.value } });
        if (!row) return null;
        return storedFileDbToEntity(row);
    }

    async findManyByIds(ids: UniqueId[]): Promise<StoredFile[]> {
        const rows = await this.prisma.file.findMany({
            where: { id: { in: ids.map(id => id.value) } },
        });
        return rows.map(row => storedFileDbToEntity(row));
    }
}

export function storedFileDbToEntity(row: FileDb): StoredFile {
    return new StoredFile(
        UniqueId.fromString(row.id),
        row.name,
        row.path,
        row.sizeBytes,
        row.deleted,
        UniqueId.fromString(row.uploadedByUserId),
        new Date(row.createdAt),
        new Date(row.updatedAt),
    );
}
