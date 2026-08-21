import { DomainError } from "@core/error";

export class InvalidRoomDescriptionError extends DomainError {
    constructor(maxLength: number) {
        super("INVALID_ROOM_DESCRIPTION", `A descrição da sala deve ter no máximo ${maxLength} caracteres.`);
    }
}
