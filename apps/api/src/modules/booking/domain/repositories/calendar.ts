import { CalendarEvent } from "@booking/domain/entities";
import { UniqueId } from "@core/base-classes";

interface CalendarRepository {
    save(calendarEvent: CalendarEvent): Promise<void>;
    findByBookingId(bookingId: UniqueId): Promise<CalendarEvent | null>;
    delete(calendarEventId: UniqueId): Promise<void>;
}

export { CalendarRepository };
