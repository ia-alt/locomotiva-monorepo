import { Entity, UniqueId } from "@core/base-classes";
import { randomBytes } from "node:crypto";
import z from "zod";
import { GovbrInvalidAuthRequestError } from "../errors";

/**
 * Um login gov.br em andamento, entre o /authorize e o retorno no /callback.
 *
 * O `id` desta entidade é a parte secreta do `state` enviado ao gov.br: um
 * UUID v4, gerado por CSPRNG (122 bits), o que o torna imprevisível — é essa
 * imprevisibilidade que sustenta a proteção contra CSRF.
 *
 * O `state` completo é o id mais um marcador de qual cliente iniciou o login
 * (`web` ou `app`). O marcador existe para a página de callback — que roda no
 * navegador, sem sessão — saber se conclui o login ali mesmo ou entrega o
 * `code` ao aplicativo instalado. É informação pública: adulterá-lo muda só
 * qual tela trata o retorno, nunca a validação do pedido.
 *
 * As regras de "ainda vale?" moram aqui, e não em quem chama, porque esquecer
 * uma delas é silencioso: o login continua funcionando e a proteção some.
 */
class GovbrAuthRequest extends Entity {
    /** Sufixo do `state` quando o login partiu do aplicativo. O mobile espelha este valor. */
    static readonly SUFIXO_STATE_APP = ".app";

    private constructor(
        id: UniqueId,
        private readonly _nonce: string,
        private readonly _codeVerifier: string,
        public readonly redirectTo: string | null,
        public readonly client: GovbrAuthRequest.Client,
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
            props.client ?? "web",
            new Date(Date.now() + validoPorMs),
            null,
        );
    }

    /** Reconstrói a partir do banco. Não valida: o registro já existe. */
    static restore(props: GovbrAuthRequest.RestoreParams): GovbrAuthRequest {
        const { id, client } = GovbrAuthRequest.parseState(props.state);
        return new GovbrAuthRequest(
            id,
            props.nonce,
            props.codeVerifier,
            props.redirectTo,
            client,
            props.expiresAt,
            props.usedAt,
        );
    }

    /** Separa o `state` em id e cliente — o inverso do getter `state`. */
    private static parseState(state: string): { id: UniqueId; client: GovbrAuthRequest.Client } {
        const sufixo = GovbrAuthRequest.SUFIXO_STATE_APP;
        if (state.endsWith(sufixo)) {
            return { id: UniqueId.fromString(state.slice(0, -sufixo.length)), client: "app" };
        }
        return { id: UniqueId.fromString(state), client: "web" };
    }

    /**
     * O `state` que vai (e volta) na URL do gov.br. É também a chave no banco,
     * então quem busca pelo valor devolvido pelo gov.br encontra direto.
     */
    get state(): string {
        return this.client === "app"
            ? `${this.id.value}${GovbrAuthRequest.SUFIXO_STATE_APP}`
            : this.id.value;
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
            client: this.client,
            expiresAt: this.expiresAt,
            usedAt: this._usedAt,
        };
    }
}

namespace GovbrAuthRequest {
    /** Quem iniciou o login: a versão web ou o aplicativo instalado. */
    export const ClientSchema = z.enum(["web", "app"]);
    export type Client = z.infer<typeof ClientSchema>;

    export type CreateParams = {
        codeVerifier: string;
        redirectTo?: string | null;
        /** Padrão `web`. */
        client?: Client;
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
        client: Client;
        expiresAt: Date;
        usedAt: Date | null;
    };
}

export { GovbrAuthRequest };
