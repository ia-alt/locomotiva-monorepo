import { Room } from "../entities";
import { UniqueId } from "@core/base-classes";

export interface RoomRepository {
    save(room: Room): Promise<void>;
    findAll(): Promise<Room[]>;
    findById(id: UniqueId): Promise<Room | null>;
    findManyByIds(ids: UniqueId[]): Promise<Room[]>;
    delete(id: UniqueId): Promise<void>;
}