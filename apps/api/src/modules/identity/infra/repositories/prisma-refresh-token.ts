import { PrismaClient, RefreshToken as RefreshTokenDb } from "@core/infra/database/prisma";
import { RefreshTokenRepository } from "src/modules/identity/domain/repositories";
import { RefreshToken } from "src/modules/identity/domain/entities";

export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async save(token: RefreshToken): Promise<void> {
        // `tokenHash` não passa pelo toJSON() da entidade — é segredo e a
        // serialização de propósito o omite. Vem do getter.
        const data = token.toJSON();
        await this.prisma.refreshToken.upsert({
            where: { id: data.id },
            update: {
                usedAt: data.usedAt,
                revokedAt: data.revokedAt,
            },
            create: {
                id: data.id,
                tokenHash: token.tokenHash,
                userId: data.userId,
                familyId: data.familyId,
                expiresAt: data.expiresAt,
                usedAt: data.usedAt,
                revokedAt: data.revokedAt,
            },
        });
    }

    async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
        const row = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });
        if (!row) return null;
        return this.dbToEntity(row);
    }

    async consumeByTokenHash(tokenHash: string, agora: Date): Promise<RefreshToken | null> {
        // As condições vão no WHERE do próprio UPDATE. O Postgres garante que
        // apenas uma transação concorrente encontre a linha ainda ativa, então
        // `count === 1` significa "eu venci a corrida".
        const { count } = await this.prisma.refreshToken.updateMany({
            where: { tokenHash, usedAt: null, revokedAt: null, expiresAt: { gt: agora } },
            data: { usedAt: agora },
        });

        if (count === 0) return null;

        const row = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });
        return row ? this.dbToEntity(row) : null;
    }

    async revokeFamily(familyId: string, agora: Date): Promise<void> {
        await this.prisma.refreshToken.updateMany({
            where: { familyId, revokedAt: null },
            data: { revokedAt: agora },
        });
    }

    async deleteExpired(agora: Date): Promise<number> {
        const { count } = await this.prisma.refreshToken.deleteMany({
            where: { expiresAt: { lt: agora } },
        });
        return count;
    }

    private dbToEntity(row: RefreshTokenDb): RefreshToken {
        return RefreshToken.restore({
            id: row.id,
            userId: row.userId,
            familyId: row.familyId,
            tokenHash: row.tokenHash,
            expiresAt: row.expiresAt,
            usedAt: row.usedAt,
            revokedAt: row.revokedAt,
        });
    }
}
