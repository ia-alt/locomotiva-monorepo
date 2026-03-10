import { ApplicationError, ErrorType } from "@core/error";
import { UniqueId } from "@core/base-classes";

export class BookingNotFoundError extends ApplicationError {
    constructor(bookingId: UniqueId) {
        super(`BOOKING_NOT_FOUND`, `Reserva com id ${bookingId.value} não encontrada`, ErrorType.NOT_FOUND);
    }
}