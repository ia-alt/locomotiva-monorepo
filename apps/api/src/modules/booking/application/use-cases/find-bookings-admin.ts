import { UseCase } from "@core/base-classes";
import { PrismaClient } from "@core/infra/database/prisma";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";
import { Prisma } from "@core/infra/database/prisma";

class FindBookingsAdminUseCase implements UseCase<FindBookingsAdminUseCase.Input, FindBookingsAdminUseCase.Output> {
    constructor(
        private readonly prisma: PrismaClient,
        private readonly authUserService: AuthUserService,
    ) { }

    async execute(params: FindBookingsAdminUseCase.Input): Promise<FindBookingsAdminUseCase.Output> {
        this.authUserService.checkIsAdmin();

        const { pageNumber, pageSize } = params.pagination;

        // Base where (no status)
        const baseWhere: Prisma.BookingWhereInput = {};

        if (params.filter?.roomId) {
            baseWhere.roomId = params.filter.roomId;
        }

        if (params.filter?.dateFrom || params.filter?.dateTo) {
            baseWhere.startTime = {};
            if (params.filter.dateFrom) {
                (baseWhere.startTime as Prisma.DateTimeFilter).gte = new Date(params.filter.dateFrom);
            }
            if (params.filter.dateTo) {
                (baseWhere.startTime as Prisma.DateTimeFilter).lte = new Date(params.filter.dateTo);
            }
        }

        if (params.filter?.search) {
            const matchingUsers = await this.prisma.user.findMany({
                where: { name: { contains: params.filter.search, mode: "insensitive" } },
                select: { id: true },
            });
            baseWhere.userId = { in: matchingUsers.map((u) => u.id) };
        }

        const userStatusFilter = params.filter?.status ?? [];
        const hasPending = userStatusFilter.length === 0 || userStatusFilter.includes("pending");

        let bookingsDb: Awaited<ReturnType<typeof this.prisma.booking.findMany>>;
        let total: number;

        if (!hasPending) {
            // No pending in filter → sort by booking date
            const where: Prisma.BookingWhereInput = { ...baseWhere, status: { in: userStatusFilter } };
            [total, bookingsDb] = await Promise.all([
                this.prisma.booking.count({ where }),
                this.prisma.booking.findMany({
                    where,
                    orderBy: { startTime: "desc" },
                    skip: (pageNumber - 1) * pageSize,
                    take: pageSize,
                }),
            ]);
        } else {
            // Pending first, then the rest sorted by booking date
            const pendingWhere: Prisma.BookingWhereInput = { ...baseWhere, status: "pending" };
            const otherStatuses = userStatusFilter.filter((s) => s !== "pending");
            const nonPendingWhere: Prisma.BookingWhereInput = {
                ...baseWhere,
                ...(otherStatuses.length > 0
                    ? { status: { in: otherStatuses } }
                    : { status: { not: "pending" } }),
            };

            const [pendingCount, nonPendingCount] = await Promise.all([
                this.prisma.booking.count({ where: pendingWhere }),
                otherStatuses.length === 0 && userStatusFilter.length > 0
                    ? Promise.resolve(0)
                    : this.prisma.booking.count({ where: nonPendingWhere }),
            ]);

            total = pendingCount + nonPendingCount;
            const pageStart = (pageNumber - 1) * pageSize;

            const pendingSkip = Math.min(pageStart, pendingCount);
            const pendingTake = Math.max(0, Math.min(pageSize, pendingCount - pageStart));

            const nonPendingTake = pageSize - pendingTake;
            const nonPendingSkip = Math.max(0, pageStart - pendingCount);

            const [pendingItems, nonPendingItems] = await Promise.all([
                pendingTake > 0
                    ? this.prisma.booking.findMany({
                          where: pendingWhere,
                          orderBy: { startTime: "desc" },
                          skip: pendingSkip,
                          take: pendingTake,
                      })
                    : [],
                nonPendingTake > 0 && !(otherStatuses.length === 0 && userStatusFilter.length > 0)
                    ? this.prisma.booking.findMany({
                          where: nonPendingWhere,
                          orderBy: { startTime: "desc" },
                          skip: nonPendingSkip,
                          take: nonPendingTake,
                      })
                    : [],
            ]);

            bookingsDb = [...pendingItems, ...nonPendingItems];
        }

        if (bookingsDb.length === 0) {
            return { items: [], total, pageNumber, pageSize, pagesCount: Math.ceil(total / pageSize) || 1 };
        }

        const userIds = [...new Set(bookingsDb.map((b) => b.userId))];
        const roomIds = [...new Set(bookingsDb.map((b) => b.roomId))];

        const [users, rooms] = await Promise.all([
            this.prisma.user.findMany({
                where: { id: { in: userIds } },
                select: { id: true, name: true, email: true },
            }),
            this.prisma.room.findMany({
                where: { id: { in: roomIds } },
                select: { id: true, name: true, capacity: true },
            }),
        ]);

        const userMap = new Map(users.map((u) => [u.id, u]));
        const roomMap = new Map(rooms.map((r) => [r.id, r]));

        const items: FindBookingsAdminUseCase.BookingItem[] = bookingsDb.map((b) => {
            const user = userMap.get(b.userId);
            const room = roomMap.get(b.roomId);
            return {
                id: b.id,
                user: { id: b.userId, name: user?.name ?? "Usuário desconhecido", email: user?.email ?? "" },
                room: { id: b.roomId, name: room?.name ?? "Sala desconhecida", capacity: room?.capacity ?? 0 },
                period: { from: b.startTime.toISOString(), to: b.endTime.toISOString() },
                status: b.status,
                title: b.title,
                description: b.description ?? undefined,
                rejectionCancelReason: b.rejectionCancelReason ?? undefined,
                createdAt: b.createdAt.toISOString(),
            };
        });

        return { items, total, pageNumber, pageSize, pagesCount: Math.ceil(total / pageSize) || 1 };
    }
}

namespace FindBookingsAdminUseCase {
    export const BookingItemSchema = z.object({
        id: z.string(),
        user: z.object({ id: z.string(), name: z.string(), email: z.string() }),
        room: z.object({ id: z.string(), name: z.string(), capacity: z.number() }),
        period: z.object({ from: z.string(), to: z.string() }),
        status: z.string(),
        title: z.string(),
        description: z.string().optional(),
        rejectionCancelReason: z.string().optional(),
        createdAt: z.string(),
    });

    export const InputSchema = z.object({
        pagination: z.object({ pageNumber: z.number().int().min(1), pageSize: z.number().int().min(1) }),
        filter: z
            .object({
                status: z.array(z.string()).optional(),
                roomId: z.string().optional(),
                search: z.string().optional(),
                dateFrom: z.string().optional(),
                dateTo: z.string().optional(),
            })
            .optional(),
    });

    export const OutputSchema = z.object({
        items: z.array(BookingItemSchema),
        total: z.number(),
        pageNumber: z.number(),
        pageSize: z.number(),
        pagesCount: z.number(),
    });

    export type BookingItem = z.infer<typeof BookingItemSchema>;
    export type Input = z.infer<typeof InputSchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { FindBookingsAdminUseCase };
