import { ValueObject } from "@core/base-classes";
import z from "zod";
import { BookingWithUser } from "src/modules/booking/domain/value-objects/booking-with-user";
import { AccessLogWithUser } from "src/modules/coworking/domain/value-objects/access-log-with-user";
import { PrintRequest } from "@printing/domain/entities";
import { PrintRequestWithDetails } from "@printing/domain/value-objects";

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
    public readonly printing: MonthReport.PrintingSummary;

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
        this.printing = this.calculatePrintingSummary();
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

    private calculatePrintingSummary(): MonthReport.PrintingSummary {
        const printRequests = this.value.printRequests.map(pr => pr.value);

        const countByStatus = new Map<PrintRequest.Status, number>();
        const perDay = new Map<number, number>();

        for (const { printRequest } of printRequests) {
            const status = printRequest.currentStatus;
            countByStatus.set(status, (countByStatus.get(status) ?? 0) + 1);

            const day = new Date(printRequest.toJSON().createdAt).getDate();
            perDay.set(day, (perDay.get(day) ?? 0) + 1);
        }

        const count = (statuses: PrintRequest.Status[]) =>
            statuses.reduce((acc, st) => acc + (countByStatus.get(st) ?? 0), 0);

        const accepted = count(PrintRequest.AcceptedStatus);
        const rejected = count([PrintRequest.Status.REJECTED]);
        // cancelados ficam de fora: não dá para saber se foram antes ou depois do aceite
        const analyzed = accepted + rejected;

        return {
            total: printRequests.length,
            accepted,
            rejected,
            delivered: count([PrintRequest.Status.DELIVERED]),
            acceptanceRate: analyzed > 0 ? Math.round((accepted / analyzed) * 100) : null,
            byStatus: Object.values(PrintRequest.Status).map(status => ({
                status,
                total: countByStatus.get(status) ?? 0,
            })),
            perDay: Array.from(perDay.entries())
                .map(([day, total]) => ({ day, total }))
                .sort((a, b) => a.day - b.day),
        };
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
            printing: this.printing,
            printRequests: this.value.printRequests.map(pr => pr.toJSON()),
        };
    }
}

namespace MonthReport {
    export const ValueSchema = z.object({
        year: z.number(),
        month: z.number(),
        bookings: z.array(z.instanceof(BookingWithUser)),
        coworkingLogs: z.array(z.instanceof(AccessLogWithUser)),
        printRequests: z.array(z.instanceof(PrintRequestWithDetails)),
    });

    export type Value = z.infer<typeof ValueSchema>;

    const DayTotalPeopleSchema = z.object({
        day: z.number(),
        coworking: z.number(),
        booking: z.number(),
    });

    export const PrintingSummarySchema = z.object({
        total: z.number(),
        /** Pedidos que chegaram a ser aceitos (inclui os que já avançaram de fase). */
        accepted: z.number(),
        rejected: z.number(),
        delivered: z.number(),
        /** % de aceitos entre os analisados (aceitos + recusados); null se nenhum foi analisado. */
        acceptanceRate: z.number().nullable(),
        byStatus: z.array(z.object({ status: PrintRequest.StatusSchema, total: z.number() })),
        perDay: z.array(z.object({ day: z.number(), total: z.number() })),
    });

    export type PrintingSummary = z.infer<typeof PrintingSummarySchema>;

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
        printing: PrintingSummarySchema,
        printRequests: z.array(PrintRequestWithDetails.JsonSchema),
    });

    export type Json = z.infer<typeof JsonSchema>;
}

export { MonthReport };
