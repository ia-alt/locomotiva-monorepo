import { DomainError, ErrorType } from "@core/error";
import { UniqueId } from "@core/base-classes";

export class InvalidFileNameError extends DomainError {
    constructor() {
        super("INVALID_FILE_NAME", "O nome do arquivo está ausente.", ErrorType.BAD_REQUEST);
    }
}

export class FileNotFoundError extends DomainError {
    constructor(id: UniqueId) {
        super("FILE_NOT_FOUND", `Arquivo com id ${id.value} não encontrado.`, ErrorType.NOT_FOUND);
    }
}

export class FileDeletedError extends DomainError {
    constructor() {
        super("FILE_DELETED", "Este arquivo foi removido do armazenamento.", ErrorType.NOT_FOUND);
    }
}
