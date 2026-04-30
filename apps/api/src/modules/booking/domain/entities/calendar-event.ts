import { Entity, UniqueId } from "@core/base-classes";
import z from "zod";

export class CalendarEvent extends Entity {
    constructor(
        id: UniqueId,
        public readonly eventId: string,
        public readonly bookingId: UniqueId,
    ) {
        super(id);
    }

    static create(input: CalendarEvent.CreateParams): CalendarEvent {
        return new CalendarEvent(
            UniqueId.create(),
            input.eventId,
            input.bookingId,
        );
    }

    toJSON(): CalendarEvent.JsonSchema {
        return {
            id: this.id.value,
            eventId: this.eventId,
            bookingId: this.bookingId.value,
        };
    }
}

export namespace CalendarEvent {
    export const JsonSchema = z.object({
        id: z.string(),
        eventId: z.string(),
        bookingId: z.string(),
    });

    export type JsonSchema = z.infer<typeof JsonSchema>;

    export type CreateParams = {
        eventId: string;
        bookingId: UniqueId;
    };
}
