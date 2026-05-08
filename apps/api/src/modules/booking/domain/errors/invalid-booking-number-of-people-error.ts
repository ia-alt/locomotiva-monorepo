import { DomainError } from "@core/error";

export class InvalidBookingNumberOfPeopleError extends DomainError {
    constructor() {
        super("INVALID_BOOKING_NUMBER_OF_PEOPLE", "O número de pessoas deve ser um inteiro positivo.");
    }
}
