import { ApplicationError, ErrorType } from "@core/error";
import { UniqueId } from "@core/base-classes";

export class PrintRequestNotFoundError extends ApplicationError {
    constructor(printRequestId: UniqueId) {
        super("PRINT_REQUEST_NOT_FOUND", `Pedido de impressão com id ${printRequestId.value} não encontrado`, ErrorType.NOT_FOUND);
    }
}
