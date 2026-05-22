import { AccessLogRepository } from "@coworking/domain/repositories";
import { AccessLog } from "@coworking/domain/entities";
import { Prisma, PrismaClient, AccessLog as AccessLogDb } from "@core/infra/database/prisma";
import { DomainEvents, UniqueId } from "@core/base-classes";
import { PaginatedQuery, PaginatedResult, OnlyDate } from "@core/value-objects";
import { endOfMonth, startOfMonth } from "date-fns";

export class PrismaAccessLogRepository implements AccessLogRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async save(log: AccessLog): Promise<void> {
        const data = log.toJSON();
        await this.prisma.accessLog.upsert({
            where: { id: data.id },
            update: {
                userId: data.userId,
                entryTime: data.entryTime,
                exitTime: data.exitTime,
                checkinTotemId: data.checkinTotemId,
            },
            create: {
                id: data.id,
                userId: data.userId,
                entryTime: data.entryTime,
                exitTime: data.exitTime,
                checkinTotemId: data.checkinTotemId,
            },
        });
        DomainEvents.dispatchEventsForAggregate(log.id);
    }

    async saveMany(logs: AccessLog[]): Promise<void> {
        await this.prisma.$transaction(
            logs.map((log) => {
                const data = log.toJSON();
                return this.prisma.accessLog.upsert({
                    where: { id: data.id },
                    update: {
                        userId: data.userId,
                        entryTime: data.entryTime,
                        exitTime: data.exitTime,
                        checkinTotemId: data.checkinTotemId,
                    },
                    create: {
                        id: data.id,
                        userId: data.userId,
                        entryTime: data.entryTime,
                        exitTime: data.exitTime,
                        checkinTotemId: data.checkinTotemId,
                    },
                });
            })
        );
        logs.forEach((log) => DomainEvents.dispatchEventsForAggregate(log.id));
    }

    async findById(id: UniqueId): Promise<AccessLog | null> {
        const log = await this.prisma.accessLog.findUnique({ where: { id: id.value } });
        if (!log) return null;
        return this.accessLogDbToEntity(log);
    }

    async findByUserIdAndActive(userId: UniqueId): Promise<AccessLog | null> {
        const log = await this.prisma.accessLog.findFirst({
            where: {
                userId: userId.value,
                exitTime: null,
            },
        });
        if (!log) return null;
        return this.accessLogDbToEntity(log);
    }

    async findAllActive(): Promise<AccessLog[]> {
        const logs = await this.prisma.accessLog.findMany({
            where: {
                exitTime: null,
            },
        });
        return logs.map((log) => this.accessLogDbToEntity(log));
    }

    async findEntriesSince(since: Date): Promise<AccessLog[]> {
        const logs = await this.prisma.accessLog.findMany({
            where: {
                entryTime: { gte: since },
            },
        });
        return logs.map((log) => this.accessLogDbToEntity(log));
    }

    async findEntriesInRange(from: Date, to: Date): Promise<AccessLog[]> {
        const logs = await this.prisma.accessLog.findMany({
            where: {
                entryTime: { gte: from, lt: to },
            },
        });
        return logs.map((log) => this.accessLogDbToEntity(log));
    }

    async findHistoryByUserId(userId: UniqueId, pagination: PaginatedQuery): Promise<PaginatedResult<typeof AccessLog.JsonSchema, AccessLog>> {
        const { take, skip } = pagination.asTakeSkip;
        const where: Prisma.AccessLogWhereInput = {
            userId: userId.value,
        };

        const logsDb = await this.prisma.accessLog.findMany({
            where,
            orderBy: {
                entryTime: 'desc',
            },
            take,
            skip,
        });

        const logs = logsDb.map((log) => this.accessLogDbToEntity(log));
        const total = await this.prisma.accessLog.count({ where });

        return PaginatedResult.create<typeof AccessLog.JsonSchema, AccessLog>({
            items: logs,
            total,
            paginatedQuery: pagination,
        });
    }

    async findAllHistory(pagination: PaginatedQuery): Promise<PaginatedResult<typeof AccessLog.JsonSchema, AccessLog>> {
        const { take, skip } = pagination.asTakeSkip;

        const logsDb = await this.prisma.accessLog.findMany({
            orderBy: {
                entryTime: 'desc',
            },
            take,
            skip,
        });

        const logs = logsDb.map((log) => this.accessLogDbToEntity(log));
        const total = await this.prisma.accessLog.count();

        return PaginatedResult.create<typeof AccessLog.JsonSchema, AccessLog>({
            items: logs,
            total,
            paginatedQuery: pagination,
        });
    }

    async findAllByMonth(year: number, month: number): Promise<AccessLog[]> {
        const refDate = new Date(year, month - 1, 1)
        const from = startOfMonth(refDate);
        const to = endOfMonth (refDate);

        const logs = await this.prisma.accessLog.findMany({
            where: {
                entryTime: { gte: from, lte: to },
            },
            orderBy: { entryTime: 'asc' },
        });
        return logs.map((log) => this.accessLogDbToEntity(log));
    }

    async findAllByDay(day: OnlyDate): Promise<AccessLog[]> {
        const from = day.toDate();
        from.setHours(0, 0, 0, 0);
        const to = day.toDate();
        to.setHours(23, 59, 59, 999);

        const logs = await this.prisma.accessLog.findMany({
            where: {
                entryTime: { gte: from, lte: to },
            },
            orderBy: { entryTime: 'asc' },
        });
        return logs.map((log) => this.accessLogDbToEntity(log));
    }

    accessLogDbToEntity(dbLog: AccessLogDb): AccessLog {
        return new AccessLog(
            UniqueId.fromString(dbLog.id),
            UniqueId.fromString(dbLog.userId),
            dbLog.entryTime,
            dbLog.exitTime,
            dbLog.checkinTotemId ? UniqueId.fromString(dbLog.checkinTotemId) : null,
        );
    }
}
