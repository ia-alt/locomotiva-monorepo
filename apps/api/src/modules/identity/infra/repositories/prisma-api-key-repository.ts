import { ApiKeyRepository } from "../../domain/repositories/api-key-repository";
import { ApiKey } from "../../domain/entities/api-key";
import { PrismaClient } from "@core/infra/database/prisma";
import { UniqueId } from "@core/base-classes";

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
}
