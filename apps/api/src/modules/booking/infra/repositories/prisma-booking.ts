import { BookingRepository } from "@booking/domain/repositories";
import { Booking as BookingDb, Prisma, PrismaClient } from "@core/infra/database/prisma";
import { UniqueId } from "@core/base-classes";
import { Booking } from "@booking/domain/entities";
import { DatePeriod, PaginatedResult } from "@core/value-objects";

export class PrismaBookingRepository implements BookingRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async save(booking: Booking): Promise<void> {
        const bookingData = booking.toJSON();
        await this.prisma.booking.upsert({
            where: { id: bookingData.id },
            update: {
                roomId: bookingData.roomId,
                userId: bookingData.userId,
                title: bookingData.title,
                description: bookingData.description,
                startTime: bookingData.period.from,
                endTime: bookingData.period.to,
                status: bookingData.status,
                rejectionCancelReason: bookingData.rejectionCancelReason,
            },
            create: {
                id: bookingData.id,
                roomId: bookingData.roomId,
                userId: bookingData.userId,
                title: bookingData.title,
                description: bookingData.description,
                startTime: bookingData.period.from,
                endTime: bookingData.period.to,
                status: bookingData.status,
                rejectionCancelReason: bookingData.rejectionCancelReason,
            },
        });
    }

    async findAll(params: BookingRepository.FindAllParams): Promise<PaginatedResult<typeof Booking.JsonSchema, Booking>> {
        const { take, skip } = params.pagination.asTakeSkip;
        const where: Prisma.BookingWhereInput = {};
        if (params.filter?.period) {
            where.startTime = {
                gte: params.filter.period.value.from,
                lte: params.filter.period.value.to,
            };
        }
        if (params.filter?.roomId) {
            where.roomId = params.filter.roomId.value;
        }
        if (params.filter?.userId) {
            where.userId = params.filter.userId.value;
        }
        if (params.filter?.status) {
            where.status = {
                in: params.filter.status,
            };
        }
        const bookingsDb = await this.prisma.booking.findMany({
            where,
            orderBy: {
                startTime: 'asc',
            },
            take,
            skip,
        });

        const bookings = bookingsDb.map((booking) => this.bookingDbToEntity(booking));
        const total = await this.prisma.booking.count({ where });

        return PaginatedResult.create<typeof Booking.JsonSchema, Booking>({
            items: bookings,
            total,
            paginatedQuery: params.pagination,
        });
    }

    async findById(id: UniqueId): Promise<Booking | null> {
        const booking = await this.prisma.booking.findUnique({ where: { id: id.value } });
        if (!booking) return null;
        return this.bookingDbToEntity(booking);
    }

    async findByDay(params: BookingRepository.FindByDayParams): Promise<Booking[]> {
        const { day, roomId, status } = params;
        const period = DatePeriod.fromBeginToEndOfTheDay(day);
        const where: Prisma.BookingWhereInput = {
            startTime: {
                gte: period.value.from,
                lte: period.value.to,
            },
        };
        if (roomId) {
            where.roomId = roomId.value;
        }
        if (status) {
            where.status = {
                in: status,
            };
        }

        const bookingsDb = await this.prisma.booking.findMany({ where, orderBy: { startTime: 'asc' } });
        return bookingsDb.map((booking) => this.bookingDbToEntity(booking));
    }

    bookingDbToEntity(booking: BookingDb): Booking {
        return new Booking(
            UniqueId.fromString(booking.id),
            UniqueId.fromString(booking.roomId),
            UniqueId.fromString(booking.userId),
            booking.title,
            booking.description,
            new DatePeriod({ from: booking.startTime, to: booking.endTime }),
            Booking.StatusSchema.parse(booking.status),
            booking.rejectionCancelReason ?? undefined
        );
    }
}