import { ApplicationError, ErrorType } from "@core/error";
import { UniqueId } from "@core/base-classes";

export class FilamentNotFoundError extends ApplicationError {
    constructor(filamentId: UniqueId) {
        super("FILAMENT_NOT_FOUND", `Filamento com id ${filamentId.value} não encontrado`, ErrorType.NOT_FOUND);
    }
}
