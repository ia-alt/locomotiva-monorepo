import { GovbrPendingIdentity } from "../entities/govbr-pending-identity";

export interface GovbrPendingIdentityRepository {
    save(pending: GovbrPendingIdentity): Promise<void>;

    /**
     * Marca como usado e devolve — em uma única operação atômica.
     * Retorna `null` se o ticket não existe, já foi usado ou expirou.
     */
    consumeByTicket(ticket: string, agora: Date): Promise<GovbrPendingIdentity | null>;

    deleteExpired(agora: Date): Promise<number>;
}
