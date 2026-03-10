import { Booking, Room } from "@booking/domain/entities";
import { User } from "src/modules/identity/domain/entities";

export interface BookingReminderEmailTemplater {
    template(params: BookingReminderEmailTemplater.Params): Promise<string>;
}

export namespace BookingReminderEmailTemplater {
    export type Params = {
        booking: Booking;
        user: User;
        room: Room;
    };
}