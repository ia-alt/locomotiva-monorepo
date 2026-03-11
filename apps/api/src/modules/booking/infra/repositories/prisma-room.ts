import { RoomRepository } from "@booking/domain/repositories";
import { Room } from "@booking/domain/entities";
import { UniqueId } from "@core/base-classes";
import { PrismaClient, Room as RoomDb } from "@core/infra/database/prisma";

export class PrismaRoomRepository implements RoomRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async save(room: Room): Promise<void> {
        const roomData = room.toJSON();
        await this.prisma.room.upsert({
            where: { id: roomData.id },
            update: {
                name: roomData.name,
                capacity: roomData.capacity,
                enabled: roomData.enabled,
            },
            create: {
                id: roomData.id,
                name: roomData.name,
                capacity: roomData.capacity,
                enabled: roomData.enabled,
            },
        });
    }

    async findAll(): Promise<Room[]> {
        const rooms = await this.prisma.room.findMany({ orderBy: { name: "asc" } });
        return rooms.map((room) => this.roomDbToEntity(room));
    }

    async findById(id: UniqueId): Promise<Room | null> {
        const room = await this.prisma.room.findUnique({ where: { id: id.value } });
        if (!room) return null;
        return this.roomDbToEntity(room);
    }

    async findManyByIds(ids: UniqueId[]): Promise<Room[]> {
        const rooms = await this.prisma.room.findMany({ where: { id: { in: ids.map(x => x.value) } } });
        return rooms.map((room) => this.roomDbToEntity(room));
    }

    roomDbToEntity(room: RoomDb): Room {
        return new Room(
            UniqueId.fromString(room.id),
            room.name,
            room.capacity,
            room.enabled
        );
    }

    async delete(id: UniqueId): Promise<void> {
        await this.prisma.room.delete({ where: { id: id.value } });
    }
}