import { DomainError, ErrorType } from "@core/error";

export class UserNotAdminError extends DomainError {
    constructor() {
        super(
            "USER_NOT_ADMIN",
            "Usuário não é administrador",
            ErrorType.FORBIDDEN
        );
    }
}



export class UnsafePasswordError extends DomainError {
    constructor() {
        super(
            "UNSAFE_PASSWORD",
            "Senha insegura. A senha deve ter pelo menos 8 caracteres, uma letra maiúscula, uma letra minúscula e um número.",
            ErrorType.BAD_REQUEST
        );
    }
}

export class InvalidCpfError extends DomainError {
    constructor() {
        super(
            "INVALID_CPF",
            "CPF inválido.",
            ErrorType.BAD_REQUEST
        );
    }
}

export class InvalidBirthDateError extends DomainError {
    constructor() {
        super(
            "INVALID_BIRTH_DATE",
            "A idade mínima é 16 anos!",
            ErrorType.BAD_REQUEST
        );
    }
}

export class InvalidCredentialsError extends DomainError {
    constructor() {
        super(
            "INVALID_CREDENTIALS",
            "Credenciais inválidas.",
            ErrorType.UNAUTHORIZED
        );
    }
}

export class UserAlreadyExistsWithEmailOrCpfError extends DomainError {
    constructor() {
        super(
            "USER_ALREADY_EXISTS_WITH_EMAIL_OR_CPF",
            "Usuário já cadastrado com este e-mail ou CPF.",
            ErrorType.BAD_REQUEST
        );
    }
}

export class InvalidOrExpiredTokenError extends DomainError {
    constructor() {
        super(
            "INVALID_OR_EXPIRED_TOKEN",
            "Token inválido ou expirado.",
            ErrorType.BAD_REQUEST
        );
    }
}

/**
 * Chave geral da integração, controlada por `GOVBR_ENABLED`.
 *
 * Desligar precisa derrubar o fluxo inteiro, não só esconder o botão: quem
 * souber o endereço da rota continuaria chamando direto.
 */
export class GovbrIntegrationDisabledError extends DomainError {
    constructor() {
        super(
            "GOVBR_INTEGRATION_DISABLED",
            "O acesso pelo gov.br está temporariamente indisponível.",
            ErrorType.FORBIDDEN
        );
    }
}

export class GovbrNotConfiguredError extends DomainError {
    constructor(missing: string) {
        super(
            "GOVBR_NOT_CONFIGURED",
            `Integração gov.br indisponível: variável ${missing} não configurada.`,
            ErrorType.INTERNAL_SERVER_ERROR
        );
    }
}

export class GovbrAuthenticationFailedError extends DomainError {
    constructor(detail?: string) {
        super(
            "GOVBR_AUTHENTICATION_FAILED",
            detail
                ? `Falha na autenticação pelo gov.br: ${detail}`
                : "Falha na autenticação pelo gov.br.",
            ErrorType.UNAUTHORIZED
        );
    }
}

/**
 * Um único erro para "state desconhecido", "já usado" e "expirado" — de
 * propósito. Distinguir os casos diria a um atacante se aquele `state` já
 * existiu, o que ajuda a sondar o fluxo.
 */
export class GovbrInvalidAuthRequestError extends DomainError {
    constructor() {
        super(
            "GOVBR_INVALID_AUTH_REQUEST",
            "Sessão de login expirada ou inválida. Tente entrar novamente.",
            ErrorType.BAD_REQUEST
        );
    }
}

export class GovbrEmailAlreadyInUseError extends DomainError {
    constructor() {
        super(
            "GOVBR_EMAIL_ALREADY_IN_USE",
            "O e-mail da sua conta gov.br já pertence a outro cadastro nesta aplicação. Entre em contato com o suporte.",
            ErrorType.CONFLICT
        );
    }
}

export class InvalidRedirectTargetError extends DomainError {
    constructor() {
        super(
            "INVALID_REDIRECT_TARGET",
            "Destino de redirecionamento inválido.",
            ErrorType.BAD_REQUEST
        );
    }
}

export class GovbrEmailUnavailableError extends DomainError {
    constructor() {
        super(
            "GOVBR_EMAIL_UNAVAILABLE",
            "Sua conta gov.br não possui e-mail verificado. Verifique seu e-mail em gov.br e tente novamente.",
            ErrorType.BAD_REQUEST
        );
    }
}

export class NoLocalPasswordError extends DomainError {
    constructor() {
        super(
            "NO_LOCAL_PASSWORD",
            "Esta conta acessa pelo gov.br e não possui senha nesta aplicação.",
            ErrorType.BAD_REQUEST
        );
    }
}

export class UserNotFoundError extends DomainError {
    constructor() {
        super(
            "USER_NOT_FOUND",
            "Usuário não encontrado.",
            ErrorType.NOT_FOUND
        );
    }
}

export class InvalidRefreshTokenError extends DomainError {
    constructor() {
        super(
            "INVALID_REFRESH_TOKEN",
            "Sessão expirada ou encerrada. Faça login novamente.",
            ErrorType.UNAUTHORIZED
        );
    }
}
