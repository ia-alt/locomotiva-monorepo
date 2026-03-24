import { IDomainEvent, UniqueId } from "@core/base-classes";
import { Booking } from "../entities/booking";

export class BookingCreatedEvent implements IDomainEvent {
    public dateTimeOccurred: Date;
    public booking: Booking;

    constructor(booking: Booking) {
        this.dateTimeOccurred = new Date();
        this.booking = booking;
    }

    getAggregateId(): UniqueId {
        return this.booking.id;
    }
}
