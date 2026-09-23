import { RefreshToken } from "../entities/refresh-token";

export interface RefreshTokenRepository {
    save(token: RefreshToken): Promise<void>;

    /** Busca pelo sha256 do valor apresentado. `null` se não existir. */
    findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;

    /**
     * Marca como usado e devolve o token — em uma única operação atômica.
     *
     * Retorna `null` se não existe, já foi usado, foi revogado ou expirou.
     * Ler e depois gravar deixaria uma janela em que dois refreshes
     * simultâneos passariam pela verificação antes de qualquer um marcar o
     * uso; a condição precisa estar no próprio UPDATE.
     */
    consumeByTokenHash(tokenHash: string, agora: Date): Promise<RefreshToken | null>;

    /** Revoga a família inteira — logout e resposta a reuso detectado. */
    revokeFamily(familyId: string, agora: Date): Promise<void>;

    /** Expurgo dos expirados. Retenção mínima é exigência de LGPD. */
    deleteExpired(agora: Date): Promise<number>;
}
