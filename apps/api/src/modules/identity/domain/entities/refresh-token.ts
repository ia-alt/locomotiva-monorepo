import { Entity, UniqueId } from "@core/base-classes";
import { createHash, randomBytes } from "node:crypto";

/**
 * Um refresh token da sessão persistente ("continuar conectado").
 *
 * O valor entregue ao cliente (`rawToken`) nasce de CSPRNG (256 bits) e só
 * existe no instante da criação: o que se persiste é o sha256 dele
 * (`tokenHash`), como no ApiKey — um vazamento do banco não vaza sessões.
 *
 * A `familyId` encadeia as rotações: o primeiro token do login cria a família
 * e cada refresh gera um sucessor na mesma. A família É a sessão — logout e
 * detecção de reuso revogam a família inteira de uma vez.
 */
class RefreshToken extends Entity {
    private constructor(
        id: UniqueId,
        public readonly userId: UniqueId,
        public readonly familyId: string,
        private readonly _tokenHash: string,
        public readonly expiresAt: Date,
        private _usedAt: Date | null,
        private _revokedAt: Date | null,
    ) {
        super(id);
    }

    static create(props: RefreshToken.CreateParams): RefreshToken.Created {
        const rawToken = randomBytes(32).toString("base64url");
        const token = new RefreshToken(
            UniqueId.create(),
            props.userId,
            props.familyId ?? UniqueId.create().value,
            RefreshToken.hashRawToken(rawToken),
            new Date(Date.now() + props.validoPorSegundos * 1000),
            null,
            null,
        );
        return { token, rawToken };
    }

    /** Reconstrói a partir do banco. Não valida: o registro já existe. */
    static restore(props: RefreshToken.RestoreParams): RefreshToken {
        return new RefreshToken(
            UniqueId.fromString(props.id),
            UniqueId.fromString(props.userId),
            props.familyId,
            props.tokenHash,
            props.expiresAt,
            props.usedAt,
            props.revokedAt,
        );
    }

    /**
     * Como o valor cru nunca é persistido, toda busca no repositório passa por
     * aqui — é o único jeito de reencontrar um token a partir do que o cliente
     * apresentou.
     */
    static hashRawToken(rawToken: string): string {
        return createHash("sha256").update(rawToken).digest("hex");
    }

    get tokenHash(): string {
        return this._tokenHash;
    }

    get usedAt(): Date | null {
        return this._usedAt;
    }

    get revokedAt(): Date | null {
        return this._revokedAt;
    }

    /** Já foi trocado numa rotação — apresentá-lo de novo é sinal de reuso. */
    wasUsed(): boolean {
        return this._usedAt !== null;
    }

    toJSON(): RefreshToken.JsonSchema {
        // Sem tokenHash: é segredo e não tem por que sair daqui.
        return {
            id: this.id.value,
            userId: this.userId.value,
            familyId: this.familyId,
            expiresAt: this.expiresAt,
            usedAt: this._usedAt,
            revokedAt: this._revokedAt,
        };
    }
}

namespace RefreshToken {
    export type CreateParams = {
        userId: UniqueId;
        validoPorSegundos: number;
        /** Ausente no login (nasce família nova); presente na rotação. */
        familyId?: string;
    };

    export type Created = {
        token: RefreshToken;
        /** O valor que vai para o cliente. Não é guardado em lugar nenhum. */
        rawToken: string;
    };

    export type RestoreParams = {
        id: string;
        userId: string;
        familyId: string;
        tokenHash: string;
        expiresAt: Date;
        usedAt: Date | null;
        revokedAt: Date | null;
    };

    export type JsonSchema = {
        id: string;
        userId: string;
        familyId: string;
        expiresAt: Date;
        usedAt: Date | null;
        revokedAt: Date | null;
    };
}

export { RefreshToken };
