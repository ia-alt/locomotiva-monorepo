import { CalendarRepository } from "@booking/domain/repositories";
import { CalendarEvent } from "@booking/domain/entities";
import { PrismaClient } from "@core/infra/database/prisma";
import { UniqueId } from "@core/base-classes";

export class PrismaCalendarRepository implements CalendarRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async save(calendarEvent: CalendarEvent): Promise<void> {
        const data = calendarEvent.toJSON();
        await this.prisma.calendarEvent.upsert({
            where: { id: data.id },
            update: {
                eventId: data.eventId,
                bookingId: data.bookingId,
            },
            create: {
                id: data.id,
                eventId: data.eventId,
                bookingId: data.bookingId,
            },
        });
    }

    async findByBookingId(bookingId: UniqueId): Promise<CalendarEvent | null> {
        const record = await this.prisma.calendarEvent.findUnique({
            where: { bookingId: bookingId.value },
        });
        if (!record) return null;
        return new CalendarEvent(
            UniqueId.fromString(record.id),
            record.eventId,
            UniqueId.fromString(record.bookingId),
        );
    }

    async delete(calendarEventId: UniqueId): Promise<void> {
        await this.prisma.calendarEvent.delete({
            where: { id: calendarEventId.value },
        });
    }
}
