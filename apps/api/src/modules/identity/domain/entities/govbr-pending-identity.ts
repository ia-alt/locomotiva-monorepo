import { Entity, UniqueId } from "@core/base-classes";
import { GovbrIdentity } from "../services/govbr-oidc";

/**
 * Comprovante de curta duração de que alguém autenticou no gov.br e está a um
 * passo de entrar: falta provar posse da conta local, ou informar os dados que
 * o gov.br não fornece.
 *
 * O `id` é o "ticket" entregue ao cliente. Vale uma vez só e por poucos minutos:
 * enquanto ele existe, quem o tiver consegue concluir o login daquela identidade.
 *
 * O telefone não é guardado de propósito: com o escopo `phone` fora, ele nunca
 * vem do gov.br, e o passo de completar cadastro pergunta de qualquer forma.
 */
class GovbrPendingIdentity extends Entity {
    private constructor(
        id: UniqueId,
        public readonly govbrSub: string,
        public readonly cpf: string,
        public readonly name: string,
        public readonly email: string | null,
        public readonly picture: string | null,
        public readonly redirectTo: string | null,
        public readonly expiresAt: Date,
        private _usedAt: Date | null,
    ) {
        super(id);
    }

    static create(props: GovbrPendingIdentity.CreateParams): GovbrPendingIdentity {
        const validoPorMs = (props.validoPorSegundos ?? 600) * 1000;
        return new GovbrPendingIdentity(
            UniqueId.create(),
            props.identity.sub,
            props.identity.cpf,
            props.identity.socialName ?? props.identity.name,
            props.identity.email,
            props.identity.picture,
            props.redirectTo ?? null,
            new Date(Date.now() + validoPorMs),
            null,
        );
    }

    static restore(props: GovbrPendingIdentity.RestoreParams): GovbrPendingIdentity {
        return new GovbrPendingIdentity(
            UniqueId.fromString(props.id),
            props.govbrSub,
            props.cpf,
            props.name,
            props.email,
            props.picture,
            props.redirectTo,
            props.expiresAt,
            props.usedAt,
        );
    }

    /** O identificador entregue ao cliente para concluir o login. */
    get ticket(): string {
        return this.id.value;
    }

    get usedAt(): Date | null {
        return this._usedAt;
    }

    toJSON(): GovbrPendingIdentity.JsonSchema {
        return {
            ticket: this.ticket,
            expiresAt: this.expiresAt,
            usedAt: this._usedAt,
        };
    }
}

namespace GovbrPendingIdentity {
    export type CreateParams = {
        identity: GovbrIdentity;
        redirectTo?: string | null;
        validoPorSegundos?: number;
    };

    export type RestoreParams = {
        id: string;
        govbrSub: string;
        cpf: string;
        name: string;
        email: string | null;
        picture: string | null;
        redirectTo: string | null;
        expiresAt: Date;
        usedAt: Date | null;
    };

    export type JsonSchema = {
        ticket: string;
        expiresAt: Date;
        usedAt: Date | null;
    };
}

export { GovbrPendingIdentity };
