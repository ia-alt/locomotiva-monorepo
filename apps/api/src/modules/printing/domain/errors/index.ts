import { DomainError, ErrorType } from "@core/error";
import { UniqueId } from "@core/base-classes";

export class PrintRequestNotInPendingStateError extends DomainError {
    constructor() {
        super(
            "PRINT_REQUEST_NOT_IN_PENDING_STATE",
            "O pedido de impressão não está no estado PENDENTE.",
            ErrorType.BAD_REQUEST,
        );
    }
}

export class PrintRequestCannotBeCancelledError extends DomainError {
    constructor() {
        super(
            "PRINT_REQUEST_CANNOT_BE_CANCELLED",
            "Este pedido de impressão não pode mais ser cancelado.",
            ErrorType.BAD_REQUEST,
        );
    }
}

export class ForbiddenPrintRequestAccessError extends DomainError {
    constructor(printRequestId: UniqueId) {
        super(
            "FORBIDDEN_PRINT_REQUEST_ACCESS",
            `Você não tem permissão para acessar o pedido de impressão com id ${printRequestId.value}`,
            ErrorType.FORBIDDEN,
        );
    }
}

export class NoPrinterAvailableError extends DomainError {
    constructor() {
        super(
            "NO_PRINTER_AVAILABLE",
            "Não há impressoras disponíveis no momento para receber novos pedidos.",
            ErrorType.CONFLICT,
        );
    }
}

export class MaterialNotAvailableError extends DomainError {
    constructor() {
        super(
            "MATERIAL_NOT_AVAILABLE",
            "O material escolhido não está disponível. Escolha um dos filamentos cadastrados.",
            ErrorType.BAD_REQUEST,
        );
    }
}

export class InvalidFilamentNameError extends DomainError {
    constructor() {
        super(
            "INVALID_FILAMENT_NAME",
            "O nome do filamento deve ter entre 2 e 40 caracteres.",
            ErrorType.BAD_REQUEST,
        );
    }
}

export class FilamentInUseError extends DomainError {
    constructor() {
        super(
            "FILAMENT_IN_USE",
            "Este filamento já foi usado em pedidos de impressão e não pode ser excluído.",
            ErrorType.CONFLICT,
        );
    }
}

export class PrintRequestReasonRequiredError extends DomainError {
    constructor() {
        super(
            "PRINT_REQUEST_REASON_REQUIRED",
            "Informe o motivo.",
            ErrorType.BAD_REQUEST,
        );
    }
}

export class FilamentAlreadyExistsError extends DomainError {
    constructor(name: string) {
        super(
            "FILAMENT_ALREADY_EXISTS",
            `Já existe um filamento chamado "${name}".`,
            ErrorType.CONFLICT,
        );
    }
}

export class PrintRequestNotApprovedError extends DomainError {
    constructor() {
        super(
            "PRINT_REQUEST_NOT_APPROVED",
            "O pedido precisa estar APROVADO para esta ação.",
            ErrorType.BAD_REQUEST,
        );
    }
}

export class PrintRequestNotInProductionError extends DomainError {
    constructor() {
        super(
            "PRINT_REQUEST_NOT_IN_PRODUCTION",
            "O pedido precisa estar EM PRODUÇÃO para ser finalizado.",
            ErrorType.BAD_REQUEST,
        );
    }
}

export class PrintRequestNotCompletedError extends DomainError {
    constructor() {
        super(
            "PRINT_REQUEST_NOT_COMPLETED",
            "O pedido precisa estar FINALIZADO para ser entregue ou descartado.",
            ErrorType.BAD_REQUEST,
        );
    }
}

export class PrintRequestPrinterLockedError extends DomainError {
    constructor() {
        super(
            "PRINT_REQUEST_PRINTER_LOCKED",
            "A impressora não pode mais ser alterada depois que a impressão foi finalizada.",
            ErrorType.BAD_REQUEST,
        );
    }
}

export class PrinterNotAllocatedError extends DomainError {
    constructor() {
        super(
            "PRINTER_NOT_ALLOCATED",
            "Vincule uma impressora ao pedido antes de iniciar a produção.",
            ErrorType.BAD_REQUEST,
        );
    }
}

export class PrinterDisabledError extends DomainError {
    constructor() {
        super(
            "PRINTER_DISABLED",
            "Esta impressora está desativada. Ative-a ou escolha outra.",
            ErrorType.BAD_REQUEST,
        );
    }
}

export class PrinterHasActiveRequestsError extends DomainError {
    constructor() {
        super(
            "PRINTER_HAS_ACTIVE_REQUESTS",
            "Esta impressora está vinculada a pedidos ativos. Realoque ou finalize os pedidos antes de excluí-la.",
            ErrorType.CONFLICT,
        );
    }
}

export class PrinterBusyError extends DomainError {
    constructor() {
        super(
            "PRINTER_BUSY",
            "Esta impressora já está em uso por outro pedido em produção.",
            ErrorType.CONFLICT,
        );
    }
}

export * from "./invalid-print-file-error";
export * from "./invalid-print-purpose-error";
