import { Booking } from "@booking/domain/entities";
import { UniqueId } from "@core/base-classes";
import { DatePeriod, OnlyDate, PaginatedQuery, PaginatedResult } from "@core/value-objects";
import z from "zod";

interface BookingRepository {
    save(booking: Booking): Promise<void>;
    findAll(params: BookingRepository.FindAllParams): Promise<PaginatedResult<typeof Booking.JsonSchema, Booking>>;
    findAllAdmin(params: BookingRepository.FindAllAdminParams): Promise<PaginatedResult<typeof BookingRepository.AdminBookingItemSchema, BookingRepository.AdminBookingItem>>;
    findById(id: UniqueId): Promise<Booking | null>;
    findByDay(params: BookingRepository.FindByDayParams): Promise<Booking[]>;
}

namespace BookingRepository {
    export type FindAllParams = {
        filter?: {
            period?: DatePeriod;
            roomId?: UniqueId;
            userId?: UniqueId;
            status?: Booking.Status[];
        };
        pagination: PaginatedQuery;
    }

    export type FindAllAdminParams = {
        pagination: PaginatedQuery;
        filter?: {
            roomId?: string;
            dateFrom?: string;
            dateTo?: string;
            search?: string;
            status?: string[];
        };
    }

    export const AdminBookingItemSchema = z.object({
        id: z.string(),
        user: z.object({ id: z.string(), name: z.string(), email: z.string(), company: z.string().nullable().optional(), jobTitle: z.string().nullable().optional() }),
        room: z.object({ id: z.string(), name: z.string(), capacity: z.number() }),
        period: z.object({ from: z.string(), to: z.string() }),
        status: z.string(),
        title: z.string(),
        description: z.string().optional(),
        rejectionCancelReason: z.string().optional(),
        createdAt: z.string(),
        numberOfPeople: z.number().optional(),
    });

    export class AdminBookingItem {
        constructor(private readonly data: z.infer<typeof AdminBookingItemSchema>) {}
        toJSON() { return this.data; }
    }

    export type FindByDayParams = {
        day: OnlyDate;
        roomId?: UniqueId;
        status?: Booking.Status[];
    }
}

export { BookingRepository };