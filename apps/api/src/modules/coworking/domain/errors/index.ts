import { DomainError, ErrorType } from "@core/error";

export class AccessLogAlreadyCheckedOutError extends DomainError {
    constructor() {
        super(
            'ACCESS_LOG_ALREADY_CHECKED_OUT',
            'O acesso já foi encerrado.',
            ErrorType.BAD_REQUEST
        );
    }
}

export class UserAlreadyHasActiveCheckinError extends DomainError {
    constructor() {
        super(
            'USER_ALREADY_HAS_ACTIVE_CHECKIN',
            'O usuário já possui um check-in ativo.',
            ErrorType.BAD_REQUEST
        );
    }
}

export class CoworkingFullCapacityError extends DomainError {
    constructor() {
        super(
            'COWORKING_FULL_CAPACITY',
            'O coworking está lotado.',
            ErrorType.BAD_REQUEST
        );
    }
}

export class UserDoesNotHaveActiveCheckinError extends DomainError {
    constructor() {
        super(
            'USER_DOES_NOT_HAVE_ACTIVE_CHECKIN',
            'O usuário não possui um check-in ativo.',
            ErrorType.BAD_REQUEST
        );
    }
}
