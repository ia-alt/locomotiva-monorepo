import { UseCase } from "@core/base-classes";
import { PrismaClient } from "@core/infra/database/prisma";
import { AuthUserService } from "src/modules/identity/domain/services";
import z from "zod";

class GetRecentActivitiesUseCase implements UseCase<void, GetRecentActivitiesUseCase.Output> {
    constructor(
        private readonly prisma: PrismaClient,
        private readonly authUserService: AuthUserService,
    ) { }

    async execute(): Promise<GetRecentActivitiesUseCase.Output> {
        this.authUserService.checkIsAdmin();

        const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // last 30 days

        const [recentCheckins, recentCheckouts, recentBookingRequests, recentBookingStatusChanges, recentUsers] =
            await Promise.all([
                this.prisma.accessLog.findMany({
                    where: { entryTime: { gte: since } },
                    orderBy: { entryTime: "desc" },
                    take: 5,
                }),
                this.prisma.accessLog.findMany({
                    where: { exitTime: { gte: since } },
                    orderBy: { exitTime: "desc" },
                    take: 5,
                }),
                this.prisma.booking.findMany({
                    where: { createdAt: { gte: since } },
                    orderBy: { createdAt: "desc" },
                    take: 5,
                }),
                this.prisma.booking.findMany({
                    where: {
                        updatedAt: { gte: since },
                        status: { in: ["confirmed", "cancelled", "rejected", "attended", "no_show"] },
                    },
                    orderBy: { updatedAt: "desc" },
                    take: 5,
                }),
                this.prisma.user.findMany({
                    where: { createdAt: { gte: since } },
                    orderBy: { createdAt: "desc" },
                    take: 5,
                }),
            ]);

        const userIds = new Set<string>([
            ...recentCheckins.map((l) => l.userId),
            ...recentCheckouts.map((l) => l.userId),
            ...recentBookingRequests.map((b) => b.userId),
            ...recentBookingStatusChanges.map((b) => b.userId),
        ]);

        const [users, rooms] = await Promise.all([
            this.prisma.user.findMany({
                where: { id: { in: Array.from(userIds) } },
                select: { id: true, name: true },
            }),
            this.prisma.room.findMany({
                where: {
                    id: {
                        in: [
                            ...recentBookingRequests.map((b) => b.roomId),
                            ...recentBookingStatusChanges.map((b) => b.roomId),
                        ],
                    },
                },
                select: { id: true, name: true },
            }),
        ]);

        const userNameMap = new Map(users.map((u) => [u.id, u.name]));
        const roomNameMap = new Map(rooms.map((r) => [r.id, r.name]));

        const activities: GetRecentActivitiesUseCase.Activity[] = [];

        for (const log of recentCheckins) {
            activities.push({
                type: "checkin",
                userName: userNameMap.get(log.userId) ?? "Usuário desconhecido",
                description: "Espaço Coworking",
                occurredAt: log.entryTime.toISOString(),
            });
        }

        for (const log of recentCheckouts) {
            if (!log.exitTime) continue;
            activities.push({
                type: "checkout",
                userName: userNameMap.get(log.userId) ?? "Usuário desconhecido",
                description: "Espaço Coworking",
                occurredAt: log.exitTime.toISOString(),
            });
        }

        for (const booking of recentBookingRequests) {
            activities.push({
                type: "booking_request",
                userName: userNameMap.get(booking.userId) ?? "Usuário desconhecido",
                description: roomNameMap.get(booking.roomId) ?? "Sala desconhecida",
                occurredAt: booking.createdAt.toISOString(),
            });
        }

        for (const booking of recentBookingStatusChanges) {
            const roomName = roomNameMap.get(booking.roomId) ?? "Sala desconhecida";
            const userName = userNameMap.get(booking.userId) ?? "Usuário desconhecido";
            const occurredAt = booking.updatedAt.toISOString();

            if (booking.status === "confirmed") {
                activities.push({ type: "booking_confirmed", userName, description: roomName, occurredAt });
            } else if (booking.status === "cancelled") {
                activities.push({ type: "booking_cancelled", userName, description: roomName, occurredAt });
            } else if (booking.status === "rejected") {
                activities.push({ type: "booking_rejected", userName, description: roomName, occurredAt });
            }
        }

        for (const user of recentUsers) {
            activities.push({
                type: "user_registered",
                userName: user.name,
                description: "Novo membro",
                occurredAt: user.createdAt.toISOString(),
            });
        }

        activities.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

        return { activities: activities.slice(0, 5) };
    }
}

namespace GetRecentActivitiesUseCase {
    export const ActivityTypeSchema = z.enum([
        "checkin",
        "checkout",
        "booking_request",
        "booking_confirmed",
        "booking_cancelled",
        "booking_rejected",
        "user_registered",
    ]);

    export const ActivitySchema = z.object({
        type: ActivityTypeSchema,
        userName: z.string(),
        description: z.string(),
        occurredAt: z.string(),
    });

    export const InputSchema = z.object({});
    export const OutputSchema = z.object({
        activities: z.array(ActivitySchema),
    });

    export type Activity = z.infer<typeof ActivitySchema>;
    export type Output = z.infer<typeof OutputSchema>;
}

export { GetRecentActivitiesUseCase };
