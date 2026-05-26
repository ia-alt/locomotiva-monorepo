import { ValueObject } from "@core/base-classes";
import z from "zod";
import { BookingWithUser } from "src/modules/booking/domain/value-objects/booking-with-user";
import { AccessLogWithUser } from "src/modules/coworking/domain/value-objects/access-log-with-user";

type DayTotalPeople = {
    day: number;
    coworking: number;
    booking: number;
};

class MonthReport extends ValueObject<MonthReport.Value> {
    public readonly totalPeopleCoworking: number;
    public readonly totalPeopleBooking: number;
    public readonly totalBookings: number;
    public readonly totalPeople: number;
    public readonly totalPeoplePerDay: DayTotalPeople[];
    public readonly totalPeopleByWeekDay: { weekday: number; total: number }[];

    constructor(value: MonthReport.Value) {
        super(value);

        this.totalPeopleCoworking = value.coworkingLogs.length;
        this.totalPeopleBooking = value.bookings.reduce(
            (acc, b) => acc + (b.value.booking.numberOfPeople ?? 1),
            0
        );
        this.totalBookings = value.bookings.length;
        this.totalPeople = this.totalPeopleCoworking + this.totalPeopleBooking;
        this.totalPeopleByWeekDay = this.calculateTotalPeopleByWeekDay();
        this.totalPeoplePerDay = this.calculateTotalPeoplePerDay();
    }

    private calculateTotalPeopleByWeekDay(): { weekday: number; total: number }[] {
        const map = new Map<number, number>();

        for (const b of this.value.bookings) {
            const weekday = new Date(b.value.booking.toJSON().period.from).getDay();
            map.set(weekday, (map.get(weekday) ?? 0) + (b.value.booking.numberOfPeople ?? 1));
        }

        for (const log of this.value.coworkingLogs) {
            const weekday = new Date(log.value.accessLog.toJSON().entryTime).getDay();
            map.set(weekday, (map.get(weekday) ?? 0) + 1);
        }

        return Array.from(map.entries())
            .map(([weekday, total]) => ({ weekday, total }))
            .sort((a, b) => a.weekday - b.weekday);
    }

    private calculateTotalPeoplePerDay(): DayTotalPeople[] {
        const map = new Map<number, DayTotalPeople>();

        for (const b of this.value.bookings) {
            const day = new Date(b.value.booking.toJSON().period.from).getDate();
            const entry = map.get(day) ?? { day, coworking: 0, booking: 0 };
            entry.booking += b.value.booking.numberOfPeople ?? 1;
            map.set(day, entry);
        }

        for (const log of this.value.coworkingLogs) {
            const day = new Date(log.value.accessLog.toJSON().entryTime).getDate();
            const entry = map.get(day) ?? { day, coworking: 0, booking: 0 };
            entry.coworking += 1;
            map.set(day, entry);
        }

        return Array.from(map.values()).sort((a, b) => a.day - b.day);
    }

    toJSON(): MonthReport.Json {
        return {
            year: this.value.year,
            month: this.value.month,
            totalPeopleCoworking: this.totalPeopleCoworking,
            totalPeopleBooking: this.totalPeopleBooking,
            totalBookings: this.totalBookings,
            totalPeople: this.totalPeople,
            totalPeoplePerDay: this.totalPeoplePerDay,
            totalPeopleByWeekDay: this.totalPeopleByWeekDay,
            bookings: this.value.bookings.map(b => b.toJSON()),
            coworkingLogs: this.value.coworkingLogs.map(l => l.toJSON()),
        };
    }
}

namespace MonthReport {
    export const ValueSchema = z.object({
        year: z.number(),
        month: z.number(),
        bookings: z.array(z.instanceof(BookingWithUser)),
        coworkingLogs: z.array(z.instanceof(AccessLogWithUser)),
    });

    export type Value = z.infer<typeof ValueSchema>;

    const DayTotalPeopleSchema = z.object({
        day: z.number(),
        coworking: z.number(),
        booking: z.number(),
    });

    export const JsonSchema = z.object({
        year: z.number(),
        month: z.number(),
        totalPeopleCoworking: z.number(),
        totalPeopleBooking: z.number(),
        totalBookings: z.number(),
        totalPeople: z.number(),
        totalPeoplePerDay: z.array(DayTotalPeopleSchema),
        totalPeopleByWeekDay: z.array(z.object({ weekday: z.number(), total: z.number() })),
        bookings: z.array(BookingWithUser.JsonSchema),
        coworkingLogs: z.array(AccessLogWithUser.JsonSchema),
    });

    export type Json = z.infer<typeof JsonSchema>;
}

export { MonthReport };
