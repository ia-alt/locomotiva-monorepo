import { ApiKeyRepository } from "../../domain/repositories/api-key-repository";
import { ApiKey } from "../../domain/entities/api-key";
import { PrismaClient } from "@core/infra/database/prisma";
import { UniqueId } from "@core/base-classes";

export class PrismaApiKeyRepository implements ApiKeyRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async save(apiKey: ApiKey): Promise<void> {
        await this.prisma.apiKey.upsert({
            where: { id: apiKey.id.value },
            create: {
                id: apiKey.id.value,
                name: apiKey.name,
                keyHash: apiKey.getKeyHash(),
                createdAt: apiKey.createdAt,
            },
            update: {
                name: apiKey.name,
                keyHash: apiKey.getKeyHash(),
            },
        });
    }

    async findAll(): Promise<ApiKey[]> {
        const data = await this.prisma.apiKey.findMany({
            where: { active: true },
            orderBy: { createdAt: 'desc' },
        });

        return data.map(
            (row) => new ApiKey(UniqueId.fromString(row.id), row.name, row.keyHash, row.createdAt, row.active)
        );
    }

    async findById(id: UniqueId): Promise<ApiKey | null> {
        const data = await this.prisma.apiKey.findUnique({
            where: { id: id.value },
        });

        if (!data) return null;

        return new ApiKey(
            UniqueId.fromString(data.id),
            data.name,
            data.keyHash,
            data.createdAt,
            data.active,
        );
    }

    async findByKeyHash(keyHash: string): Promise<ApiKey | null> {
        const data = await this.prisma.apiKey.findFirst({
            where: { keyHash, active: true },
        });

        if (!data) return null;

        return new ApiKey(
            UniqueId.fromString(data.id),
            data.name,
            data.keyHash,
            data.createdAt,
            data.active,
        );
    }

    async deactivate(id: string): Promise<void> {
        await this.prisma.apiKey.update({
            where: { id },
            data: { active: false },
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.apiKey.delete({
            where: { id },
        });
    }
}
