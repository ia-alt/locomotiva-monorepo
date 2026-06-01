import { BookingRepository } from "@booking/domain/repositories";
import { Booking as BookingDb, Prisma, PrismaClient } from "@core/infra/database/prisma";
import { UniqueId, DomainEvents } from "@core/base-classes";
import { Booking } from "@booking/domain/entities";
import { DatePeriod, OnlyDate, OnlyTime, PaginatedResult } from "@core/value-objects";
import { TimeInterval } from "src/modules/operating-hours/domain/value-objects";
import { endOfDay } from "date-fns";

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
                createdAt: bookingData.createdAt,
                updatedAt: bookingData.updatedAt,
                numberOfPeople: bookingData.numberOfPeople,
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
                createdAt: bookingData.createdAt,
                updatedAt: bookingData.updatedAt,
                numberOfPeople: bookingData.numberOfPeople,
            },
        });
        DomainEvents.dispatchEventsForAggregate(booking.id);
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
                startTime: 'desc',
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

    async findAllAdmin(params: BookingRepository.FindAllAdminParams): Promise<PaginatedResult<typeof BookingRepository.AdminBookingItemSchema, BookingRepository.AdminBookingItem>> {
        const baseWhere = await this.buildAdminWhere(params.filter);
        const [bookingsDb, total] = await this.fetchWithPendingFirst(baseWhere, params.pagination, params.filter?.status ?? []);

        const items = await this.enrichBookings(bookingsDb);

        return PaginatedResult.create<typeof BookingRepository.AdminBookingItemSchema, BookingRepository.AdminBookingItem>({
            items,
            total,
            paginatedQuery: params.pagination,
        });
    }

    private async buildAdminWhere(filter: BookingRepository.FindAllAdminParams["filter"]): Promise<Prisma.BookingWhereInput> {
        const where: Prisma.BookingWhereInput = {};

        if (filter?.roomId) {
            where.roomId = filter.roomId;
        }

        if (filter?.dateFrom || filter?.dateTo) {
            where.startTime = {
                ...(filter.dateFrom ? { gte: new Date(filter.dateFrom + "T12:00:00") } : {}),
                ...(filter.dateTo ? { lte: endOfDay(new Date(filter.dateTo + "T12:00:00")) } : {}),
            };
        }

        if (filter?.search) {
            const matchingUsers = await this.prisma.user.findMany({
                where: { name: { contains: filter.search, mode: "insensitive" } },
                select: { id: true },
            });
            where.userId = { in: matchingUsers.map((u) => u.id) };
        }

        return where;
    }

    private async fetchWithPendingFirst(
        baseWhere: Prisma.BookingWhereInput,
        pagination: BookingRepository.FindAllAdminParams["pagination"],
        statusFilter: string[],
    ): Promise<[Awaited<ReturnType<typeof this.prisma.booking.findMany>>, number]> {
        const { pageNumber, pageSize } = pagination;
        const hasPending = statusFilter.length === 0 || statusFilter.includes("pending");

        if (!hasPending) {
            const where: Prisma.BookingWhereInput = { ...baseWhere, status: { in: statusFilter } };
            const [total, items] = await Promise.all([
                this.prisma.booking.count({ where }),
                this.prisma.booking.findMany({ where, orderBy: { startTime: "desc" }, skip: (pageNumber - 1) * pageSize, take: pageSize }),
            ]);
            return [items, total];
        }

        const otherStatuses = statusFilter.filter((s) => s !== "pending");
        const pendingWhere: Prisma.BookingWhereInput = { ...baseWhere, status: "pending" };
        const nonPendingWhere: Prisma.BookingWhereInput = {
            ...baseWhere,
            ...(otherStatuses.length > 0 ? { status: { in: otherStatuses } } : { status: { not: "pending" } }),
        };

        const skipNonPending = otherStatuses.length === 0 && statusFilter.length > 0;
        const [pendingCount, nonPendingCount] = await Promise.all([
            this.prisma.booking.count({ where: pendingWhere }),
            skipNonPending ? Promise.resolve(0) : this.prisma.booking.count({ where: nonPendingWhere }),
        ]);

        const total = pendingCount + nonPendingCount;
        const pageStart = (pageNumber - 1) * pageSize;
        const pendingTake = Math.max(0, Math.min(pageSize, pendingCount - pageStart));
        const nonPendingTake = pageSize - pendingTake;

        const [pendingItems, nonPendingItems] = await Promise.all([
            pendingTake > 0 ? this.prisma.booking.findMany({ where: pendingWhere, orderBy: { startTime: "desc" }, skip: Math.min(pageStart, pendingCount), take: pendingTake }) : [],
            nonPendingTake > 0 && !skipNonPending ? this.prisma.booking.findMany({ where: nonPendingWhere, orderBy: { startTime: "desc" }, skip: Math.max(0, pageStart - pendingCount), take: nonPendingTake }) : [],
        ]);

        return [[...pendingItems, ...nonPendingItems], total];
    }

    private async enrichBookings(bookingsDb: Awaited<ReturnType<typeof this.prisma.booking.findMany>>): Promise<BookingRepository.AdminBookingItem[]> {
        if (bookingsDb.length === 0) return [];

        const userIds = [...new Set(bookingsDb.map((b) => b.userId))];
        const roomIds = [...new Set(bookingsDb.map((b) => b.roomId))];

        const [users, rooms] = await Promise.all([
            this.prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true, email: true, company: true, jobTitle: true } }),
            this.prisma.room.findMany({ where: { id: { in: roomIds } }, select: { id: true, name: true, capacity: true } }),
        ]);

        const userMap = new Map(users.map((u) => [u.id, u]));
        const roomMap = new Map(rooms.map((r) => [r.id, r]));

        return bookingsDb.map((b) => new BookingRepository.AdminBookingItem({
            id: b.id,
            user: { id: b.userId, name: userMap.get(b.userId)?.name ?? "Usuário desconhecido", email: userMap.get(b.userId)?.email ?? "", company: userMap.get(b.userId)?.company ?? null, jobTitle: userMap.get(b.userId)?.jobTitle ?? null },
            room: { id: b.roomId, name: roomMap.get(b.roomId)?.name ?? "Sala desconhecida", capacity: roomMap.get(b.roomId)?.capacity ?? 0 },
            period: { from: b.startTime.toISOString(), to: b.endTime.toISOString() },
            day: OnlyDate.fromDate(b.startTime).toJSON(),
            timeInterval: new TimeInterval({
                start: OnlyTime.fromDate(b.startTime),
                end: OnlyTime.fromDate(b.endTime),
            }).toJSON(),
            status: b.status,
            title: b.title,
            description: b.description ?? undefined,
            rejectionCancelReason: b.rejectionCancelReason ?? undefined,
            createdAt: b.createdAt.toISOString(),
            numberOfPeople: b.numberOfPeople ?? null,
        }));
    }

    async findAllByMonth(year: number, month: number): Promise<Booking[]> {
        const from = new Date(year, month - 1, 1, 0, 0, 0, 0);
        const to = new Date(year, month, 0, 23, 59, 59, 999);

        const bookingsDb = await this.prisma.booking.findMany({
            where: {
                startTime: { gte: from, lte: to },
            },
            orderBy: { startTime: 'asc' },
        });
        return bookingsDb.map((booking) => this.bookingDbToEntity(booking));
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
            booking.rejectionCancelReason ?? undefined,
            new Date(booking.createdAt),
            new Date(booking.updatedAt),
            booking.numberOfPeople,
        );
    }
}