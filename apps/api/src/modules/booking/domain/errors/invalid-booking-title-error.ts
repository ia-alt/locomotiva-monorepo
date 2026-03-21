import { DomainError } from "@core/error";

export class InvalidBookingTitleError extends DomainError {
    constructor() {
        super("INVALID_BOOKING_TITLE", "O título da reserva deve ter entre 3 e 50 caracteres.");
    }
}
