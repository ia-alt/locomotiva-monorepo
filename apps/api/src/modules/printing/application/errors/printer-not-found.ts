import { ApplicationError, ErrorType } from "@core/error";
import { UniqueId } from "@core/base-classes";

export class PrinterNotFoundError extends ApplicationError {
    constructor(printerId: UniqueId) {
        super("PRINTER_NOT_FOUND", `Impressora com id ${printerId.value} não encontrada`, ErrorType.NOT_FOUND);
    }
}
