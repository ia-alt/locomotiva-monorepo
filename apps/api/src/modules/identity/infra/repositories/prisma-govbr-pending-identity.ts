import { PrismaClient, GovbrPendingIdentity as GovbrPendingIdentityDb } from "@core/infra/database/prisma";
import { GovbrPendingIdentityRepository } from "src/modules/identity/domain/repositories";
import { GovbrPendingIdentity } from "src/modules/identity/domain/entities";

export class PrismaGovbrPendingIdentityRepository implements GovbrPendingIdentityRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async save(pending: GovbrPendingIdentity): Promise<void> {
        await this.prisma.govbrPendingIdentity.create({
            data: {
                id: pending.ticket,
                govbrSub: pending.govbrSub,
                cpf: pending.cpf,
                name: pending.name,
                email: pending.email,
                picture: pending.picture,
                redirectTo: pending.redirectTo,
                expiresAt: pending.expiresAt,
            },
        });
    }

    async consumeByTicket(ticket: string, agora: Date): Promise<GovbrPendingIdentity | null> {
        // Mesma razão do consumeByState: as condições vão no WHERE do UPDATE,
        // para que duas requisições simultâneas não passem as duas.
        const { count } = await this.prisma.govbrPendingIdentity.updateMany({
            where: { id: ticket, usedAt: null, expiresAt: { gt: agora } },
            data: { usedAt: agora },
        });

        if (count === 0) return null;

        const row = await this.prisma.govbrPendingIdentity.findUnique({ where: { id: ticket } });
        return row ? this.dbToEntity(row) : null;
    }

    async deleteExpired(agora: Date): Promise<number> {
        const { count } = await this.prisma.govbrPendingIdentity.deleteMany({
            where: { expiresAt: { lt: agora } },
        });
        return count;
    }

    private dbToEntity(row: GovbrPendingIdentityDb): GovbrPendingIdentity {
        return GovbrPendingIdentity.restore({
            id: row.id,
            govbrSub: row.govbrSub,
            cpf: row.cpf,
            name: row.name,
            email: row.email,
            picture: row.picture,
            redirectTo: row.redirectTo,
            expiresAt: row.expiresAt,
            usedAt: row.usedAt,
        });
    }
}
