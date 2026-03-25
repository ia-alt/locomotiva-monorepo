import { ApiKeyRepository } from "../../domain/repositories/api-key-repository";
import { ApiKey } from "../../domain/entities/api-key";
import { PrismaClient } from "@core/infra/database/prisma";
import { UniqueId } from "@core/base-classes";
import { PaginatedQuery, PaginatedResult } from "@core/value-objects";

export class PrismaApiKeyRepository implements ApiKeyRepository {
    constructor(private readonly prisma: PrismaClient) {}

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

    async findById(id: string): Promise<ApiKey | null> {
        const data = await this.prisma.apiKey.findUnique({
            where: { id },
        });

        if (!data) return null;

        return new ApiKey(
            UniqueId.fromString(data.id),
            data.name,
            data.keyHash,
            data.createdAt,
        );
    }

    async findByKeyHash(keyHash: string): Promise<ApiKey | null> {
        const data = await this.prisma.apiKey.findFirst({
            where: { keyHash },
        });

        if (!data) return null;

        return new ApiKey(
            UniqueId.fromString(data.id),
            data.name,
            data.keyHash,
            data.createdAt,
        );
    }

    async delete(id: string): Promise<void> {
        await this.prisma.apiKey.delete({
            where: { id },
        });
    }

    async findAll(pagination: PaginatedQuery, search?: string): Promise<PaginatedResult<typeof ApiKey.JsonSchema, ApiKey>> {
        const { take, skip } = pagination.asTakeSkip;
        
        const where = search
            ? { name: { contains: search, mode: 'insensitive' as const } }
            : undefined;

        const [keysDb, total] = await Promise.all([
            this.prisma.apiKey.findMany({ where, orderBy: { name: 'asc' }, take, skip }),
            this.prisma.apiKey.count({ where }),
        ]);

        const items = keysDb.map(data => new ApiKey(
            UniqueId.fromString(data.id),
            data.name,
            data.keyHash,
            data.createdAt,
        ));

        return PaginatedResult.create({ items, total, paginatedQuery: pagination });
    }
}
