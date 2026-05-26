import { ValueObject } from "@core/base-classes";
import z from "zod";
import { Booking } from "../entities/booking";
import { Room } from "../entities/room";
import { User } from "src/modules/identity/domain/entities";

class BookingWithUser extends ValueObject<BookingWithUser.Value> {
    constructor(value: BookingWithUser.Value) {
        super(value);
    }

    toJSON(): BookingWithUser.Json {
        return {
            booking: this.value.booking.toJSON(),
            user: this.value.user.toJSON(),
            room: this.value.room.toJSON(),
        };
    }
}

namespace BookingWithUser {
    export const ValueSchema = z.object({
        booking: z.instanceof(Booking),
        user: z.instanceof(User),
        room: z.instanceof(Room),
    });

    export type Value = z.infer<typeof ValueSchema>;

    export const JsonSchema = z.object({
        booking: Booking.JsonSchema,
        user: User.JsonSchema,
        room: Room.JsonSchema,
    });

    export type Json = z.infer<typeof JsonSchema>;
}

export { BookingWithUser };
