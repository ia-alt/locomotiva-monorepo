import { IDomainEvent, UniqueId } from "@core/base-classes";
import { Booking } from "../entities/booking";

export class BookingRejectedEvent implements IDomainEvent {
    public dateTimeOccurred: Date;
    public booking: Booking;
    public reason: string;

    constructor(booking: Booking, reason: string) {
        this.dateTimeOccurred = new Date();
        this.booking = booking;
        this.reason = reason;
    }

    getAggregateId(): UniqueId {
        return this.booking.id;
    }
}
