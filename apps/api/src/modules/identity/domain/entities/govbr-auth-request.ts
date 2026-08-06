import { Entity, UniqueId } from "@core/base-classes";
import { randomBytes } from "node:crypto";
import { GovbrInvalidAuthRequestError } from "../errors";

/**
 * Um login gov.br em andamento, entre o /authorize e o retorno no /callback.
 *
 * O `id` desta entidade É o `state` enviado ao gov.br: um UUID v4, gerado por
 * CSPRNG (122 bits), o que o torna imprevisível — é essa imprevisibilidade que
 * sustenta a proteção contra CSRF.
 *
 * As regras de "ainda vale?" moram aqui, e não em quem chama, porque esquecer
 * uma delas é silencioso: o login continua funcionando e a proteção some.
 */
class GovbrAuthRequest extends Entity {
    private constructor(
        id: UniqueId,
        private readonly _nonce: string,
        private readonly _codeVerifier: string,
        public readonly redirectTo: string | null,
        public readonly expiresAt: Date,
        private _usedAt: Date | null,
    ) {
        super(id);
    }

    static create(props: GovbrAuthRequest.CreateParams): GovbrAuthRequest {
        const validoPorMs = (props.validoPorSegundos ?? 600) * 1000;
        return new GovbrAuthRequest(
            UniqueId.create(),
            randomBytes(16).toString("base64url"),
            props.codeVerifier,
            props.redirectTo ?? null,
            new Date(Date.now() + validoPorMs),
            null,
        );
    }

    /** Reconstrói a partir do banco. Não valida: o registro já existe. */
    static restore(props: GovbrAuthRequest.RestoreParams): GovbrAuthRequest {
        return new GovbrAuthRequest(
            UniqueId.fromString(props.state),
            props.nonce,
            props.codeVerifier,
            props.redirectTo,
            props.expiresAt,
            props.usedAt,
        );
    }

    /** O `state` que vai (e volta) na URL do gov.br. */
    get state(): string {
        return this.id.value;
    }

    /** Confrontado com o claim `nonce` do id_token — barra replay. */
    get nonce(): string {
        return this._nonce;
    }

    /** Segredo do PKCE. Nunca pode chegar ao navegador. */
    get codeVerifier(): string {
        return this._codeVerifier;
    }

    get usedAt(): Date | null {
        return this._usedAt;
    }

    /**
     * Marca como consumido. Lança se já foi usado ou se expirou.
     *
     * O uso único é o que impede que um `code` interceptado seja trocado uma
     * segunda vez. Quem chama deve persistir logo em seguida.
     */
    consume(agora: Date = new Date()): void {
        if (this._usedAt !== null) {
            throw new GovbrInvalidAuthRequestError();
        }
        if (this.expiresAt <= agora) {
            throw new GovbrInvalidAuthRequestError();
        }
        this._usedAt = agora;
    }

    toJSON(): GovbrAuthRequest.JsonSchema {
        // Sem nonce e sem codeVerifier: são segredos e não têm por que sair daqui.
        return {
            state: this.state,
            redirectTo: this.redirectTo,
            expiresAt: this.expiresAt,
            usedAt: this._usedAt,
        };
    }
}

namespace GovbrAuthRequest {
    export type CreateParams = {
        codeVerifier: string;
        redirectTo?: string | null;
        validoPorSegundos?: number;
    };

    export type RestoreParams = {
        state: string;
        nonce: string;
        codeVerifier: string;
        redirectTo: string | null;
        expiresAt: Date;
        usedAt: Date | null;
    };

    export type JsonSchema = {
        state: string;
        redirectTo: string | null;
        expiresAt: Date;
        usedAt: Date | null;
    };
}

export { GovbrAuthRequest };
