import { DomainError } from "@core/error";

export class InvalidPrintPurposeError extends DomainError {
    constructor() {
        super("INVALID_PRINT_PURPOSE", "O motivo da impressão deve ter entre 5 e 500 caracteres.");
    }
}
