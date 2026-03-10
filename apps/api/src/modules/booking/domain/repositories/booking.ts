import { Booking } from "@booking/domain/entities";
import { UniqueId } from "@core/base-classes";
import { DatePeriod, OnlyDate, PaginatedQuery, PaginatedResult } from "@core/value-objects";

interface BookingRepository {
    save(booking: Booking): Promise<void>;
    findAll(params: BookingRepository.FindAllParams): Promise<PaginatedResult<typeof Booking.JsonSchema, Booking>>;
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

    export type FindByDayParams = {
        day: OnlyDate;
        roomId?: UniqueId;
        status?: Booking.Status[];
    }
}

export { BookingRepository };