import { DomainError } from "@core/error";

export class InvalidBookingDescriptionError extends DomainError {
    constructor() {
        super("INVALID_BOOKING_DESCRIPTION", "A descrição da reserva deve ter entre 10 e 200 caracteres.");
    }
}
