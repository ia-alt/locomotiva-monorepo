import { ApplicationError, ErrorType } from "@core/error";
import { UniqueId } from "@core/base-classes";

export class RoomNotFoundError extends ApplicationError {
    constructor(roomId: UniqueId) {
        super(`ROOM_NOT_FOUND`, `Sala com id ${roomId.value} não encontrada`, ErrorType.NOT_FOUND);
    }
}