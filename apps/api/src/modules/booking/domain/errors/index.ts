import { DomainError, ErrorType } from "@core/error";
import { UniqueId } from "@core/base-classes";

export class ForbiddenBookingAccessException extends DomainError {
    constructor(bookingId: UniqueId) {
        super(`FORBIDDEN_BOOKING_ACCESS`, `Você não tem permissão para acessar a reserva com id ${bookingId.value}`, ErrorType.FORBIDDEN);
    }
}

export class BookingLeadTimeViolationError extends DomainError {
    constructor(leadTimeHours: number) {
        super(
            'BOOKING_LEAD_TIME_VIOLATION',
            `A reserva deve ser cancelada com pelo menos ${leadTimeHours} horas de antecedência.`,
            ErrorType.BAD_REQUEST
        );
    }
}

export class RoomUnavailableError extends DomainError {
    constructor() {
        super(`ROOM_UNAVAILABLE`, `Sala não está disponível para o período selecionado.`, ErrorType.BAD_REQUEST);
    }
}

export class BookingNotInPendingStateError extends DomainError {
    constructor() {
        super(
            'BOOKING_NOT_IN_PENDING_STATE',
            'A reserva não está no estado PENDENTE.',
            ErrorType.BAD_REQUEST
        );
    }
}

export class BookingCannotBeCancelledError extends DomainError {
    constructor() {
        super(
            'BOOKING_CANNOT_BE_CANCELLED',
            'A reserva não pode ser cancelada.',
            ErrorType.BAD_REQUEST
        );
    }
}

export class BookingInPastError extends DomainError {
    constructor() {
        super(
            'BOOKING_IN_PAST',
            'Não é possível criar uma reserva para um horário que já passou.',
            ErrorType.BAD_REQUEST
        );
    }
}

export class RoomCapacityExceededError extends DomainError {
    constructor(requested: number, capacity: number) {
        super(
            'ROOM_CAPACITY_EXCEEDED',
            `O número de pessoas (${requested}) excede a capacidade da sala (${capacity}).`,
            ErrorType.BAD_REQUEST
        );
    }
}

export * from "./invalid-booking-title-error";
export * from "./invalid-booking-description-error";

