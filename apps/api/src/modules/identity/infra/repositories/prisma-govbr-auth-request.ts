import { PrismaClient, GovbrAuthRequest as GovbrAuthRequestDb } from "@core/infra/database/prisma";
import { GovbrAuthRequestRepository } from "src/modules/identity/domain/repositories";
import { GovbrAuthRequest } from "src/modules/identity/domain/entities";

export class PrismaGovbrAuthRequestRepository implements GovbrAuthRequestRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async save(request: GovbrAuthRequest): Promise<void> {
        // `nonce` e `codeVerifier` não passam pelo toJSON() da entidade — são
        // segredos e a serialização de propósito os omite. Vêm dos getters.
        await this.prisma.govbrAuthRequest.upsert({
            where: { state: request.state },
            update: {
                usedAt: request.usedAt,
            },
            create: {
                state: request.state,
                nonce: request.nonce,
                codeVerifier: request.codeVerifier,
                redirectTo: request.redirectTo,
                expiresAt: request.expiresAt,
                usedAt: request.usedAt,
            },
        });
    }

    async findByState(state: string): Promise<GovbrAuthRequest | null> {
        const row = await this.prisma.govbrAuthRequest.findUnique({ where: { state } });
        if (!row) return null;
        return this.dbToEntity(row);
    }

    async consumeByState(state: string, agora: Date): Promise<GovbrAuthRequest | null> {
        // As três condições vão no WHERE do próprio UPDATE. O Postgres garante
        // que apenas uma transação concorrente encontre a linha ainda não usada,
        // então `count === 1` significa "eu venci a corrida".
        const { count } = await this.prisma.govbrAuthRequest.updateMany({
            where: { state, usedAt: null, expiresAt: { gt: agora } },
            data: { usedAt: agora },
        });

        if (count === 0) return null;

        const row = await this.prisma.govbrAuthRequest.findUnique({ where: { state } });
        return row ? this.dbToEntity(row) : null;
    }

    async deleteExpired(agora: Date): Promise<number> {
        const { count } = await this.prisma.govbrAuthRequest.deleteMany({
            where: { expiresAt: { lt: agora } },
        });
        return count;
    }

    private dbToEntity(row: GovbrAuthRequestDb): GovbrAuthRequest {
        return GovbrAuthRequest.restore({
            state: row.state,
            nonce: row.nonce,
            codeVerifier: row.codeVerifier,
            redirectTo: row.redirectTo,
            expiresAt: row.expiresAt,
            usedAt: row.usedAt,
        });
    }
}
