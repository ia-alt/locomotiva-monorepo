import { Booking } from "@booking/domain/entities";

export interface CalendarService {
    addEventOfBooking(booking: Booking): Promise<void>;
    removeEventOfBookingIfExists(booking: Booking): Promise<void>;
}
