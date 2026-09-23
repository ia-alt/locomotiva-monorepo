import { GovbrAuthRequest } from "../entities/govbr-auth-request";

export interface GovbrAuthRequestRepository {
    save(request: GovbrAuthRequest): Promise<void>;

    /** Busca pelo `state` devolvido pelo gov.br. `null` se não existir. */
    findByState(state: string): Promise<GovbrAuthRequest | null>;

    /**
     * Marca como usado e devolve o pedido — em uma única operação atômica.
     *
     * Retorna `null` se o `state` não existe, já foi usado ou expirou. Ler e
     * depois gravar deixaria uma janela em que duas requisições simultâneas
     * passariam pela verificação antes de qualquer uma marcar o uso; a condição
     * precisa estar no próprio UPDATE.
     */
    consumeByState(state: string, agora: Date): Promise<GovbrAuthRequest | null>;

    /** Expurgo dos expirados. Retenção mínima é exigência de LGPD. */
    deleteExpired(agora: Date): Promise<number>;
}
