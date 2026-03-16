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

export class UserNotSystemError extends DomainError {
    constructor() {
        super(
            "USER_NOT_SYSTEM",
            "Usuário não é sistema",
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

export class UserNotFoundError extends DomainError {
    constructor() {
        super(
            "USER_NOT_FOUND",
            "Usuário não encontrado.",
            ErrorType.NOT_FOUND
        );
    }
}