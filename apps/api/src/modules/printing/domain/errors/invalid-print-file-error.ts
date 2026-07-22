import { DomainError } from "@core/error";

export class InvalidPrintFileError extends DomainError {
    constructor(reason: string) {
        super("INVALID_PRINT_FILE", `Arquivo de impressão inválido. ${reason}`);
    }
}
