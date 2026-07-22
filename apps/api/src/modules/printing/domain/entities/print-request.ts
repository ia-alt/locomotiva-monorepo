import { AggregateRoot, UniqueId } from "@core/base-classes";
import z from "zod";
import { PrintRequestCreatedEvent } from "../events/print-request-created";
import { PrintRequestApprovedEvent } from "../events/print-request-approved";
import { PrintRequestRejectedEvent } from "../events/print-request-rejected";
import { PrintRequestCancelledEvent } from "../events/print-request-cancelled";
import { PrintRequestCompletedEvent } from "../events/print-request-completed";
import { PrintPurpose } from "../value-objects/print-purpose";
import {
    ForbiddenPrintRequestAccessError,
    PrintRequestNotInPendingStateError,
    PrintRequestCannotBeCancelledError,
    PrintRequestNotApprovedError,
    PrintRequestNotInProductionError,
    PrintRequestNotCompletedError,
    PrintRequestPrinterLockedError,
    PrintRequestReasonRequiredError,
    PrinterNotAllocatedError,
} from "../errors";

export class PrintRequest extends AggregateRoot {
    constructor(
        id: UniqueId,
        public readonly userId: UniqueId,
        private _printerId: UniqueId | null,
        public readonly purpose: string,
        public readonly stlFileId: UniqueId,
        public readonly gcodeFileId: UniqueId,
        public readonly filamentId: UniqueId,
        private _status: PrintRequest.Status,
        private _rejectionCancelReason: string | null,
        private _createdAt: Date,
        private _updatedAt: Date,
    ) {
        super(id);
        new PrintPurpose(purpose);
    }

    get printerId(): UniqueId | null {
        return this._printerId;
    }

    get currentStatus(): PrintRequest.Status {
        return this._status;
    }

    static create(input: PrintRequest.CreateParams): PrintRequest {
        const printRequest = new PrintRequest(
            UniqueId.create(),
            input.userId,
            null,
            input.purpose,
            input.stlFileId,
            input.gcodeFileId,
            input.filamentId,
            PrintRequest.Status.PENDING,
            null,
            new Date(),
            new Date(),
        );
        printRequest.addDomainEvent(new PrintRequestCreatedEvent(printRequest));
        return printRequest;
    }

    /** Aceite simples: nesta etapa o técnico ainda não vincula impressora. */
    approve(): void {
        if (this._status !== PrintRequest.Status.PENDING) {
            throw new PrintRequestNotInPendingStateError();
        }
        this._status = PrintRequest.Status.APPROVED;
        this._updatedAt = new Date();
        this.addDomainEvent(new PrintRequestApprovedEvent(this));
    }

    /**
     * Vincula (ou troca) a impressora de um pedido já aceito. Editável até a
     * finalização — depois de impresso não faz mais sentido trocar.
     */
    allocatePrinter(printerId: UniqueId): void {
        const allowed = [PrintRequest.Status.APPROVED, PrintRequest.Status.IN_PRODUCTION];
        if (!allowed.includes(this._status)) {
            if (this._status === PrintRequest.Status.PENDING) throw new PrintRequestNotApprovedError();
            throw new PrintRequestPrinterLockedError();
        }
        this._printerId = printerId;
        this._updatedAt = new Date();
    }

    /**
     * Técnico inicia a impressão. Invariante: só entra em produção com uma
     * impressora vinculada. A regra de ocupação (1 por impressora) é do
     * PrintRequestService (checkPrinterIsFree). Não emite evento de domínio:
     * por decisão de produto, "em produção" não notifica ninguém.
     */
    startProduction(): void {
        if (this._status !== PrintRequest.Status.APPROVED) {
            throw new PrintRequestNotApprovedError();
        }
        if (!this._printerId) {
            throw new PrinterNotAllocatedError();
        }
        this._status = PrintRequest.Status.IN_PRODUCTION;
        this._updatedAt = new Date();
    }

    /** Técnico marca a impressão como finalizada (pronta para retirada; libera a impressora). */
    complete(): void {
        if (this._status !== PrintRequest.Status.IN_PRODUCTION) {
            throw new PrintRequestNotInProductionError();
        }
        this._status = PrintRequest.Status.COMPLETED;
        this._updatedAt = new Date();
        this.addDomainEvent(new PrintRequestCompletedEvent(this));
    }

    /** O usuário retirou a peça. */
    deliver(): void {
        if (this._status !== PrintRequest.Status.COMPLETED) {
            throw new PrintRequestNotCompletedError();
        }
        this._status = PrintRequest.Status.DELIVERED;
        this._updatedAt = new Date();
    }

    /** A peça pronta não foi retirada e foi descartada. */
    discard(reason: string): void {
        if (this._status !== PrintRequest.Status.COMPLETED) {
            throw new PrintRequestNotCompletedError();
        }
        this._status = PrintRequest.Status.DISCARDED;
        this._rejectionCancelReason = PrintRequest.ensureReason(reason);
        this._updatedAt = new Date();
    }

    reject(reason: string): void {
        if (this._status !== PrintRequest.Status.PENDING) {
            throw new PrintRequestNotInPendingStateError();
        }
        this._status = PrintRequest.Status.REJECTED;
        this._rejectionCancelReason = PrintRequest.ensureReason(reason);
        this._updatedAt = new Date();
        this.addDomainEvent(new PrintRequestRejectedEvent(this, this._rejectionCancelReason));
    }

    cancel(executorId: UniqueId): void {
        this.checkOwner(executorId);

        // O cliente só cancela enquanto pendente ou aprovado (antes da produção).
        const cancelableStatus = [PrintRequest.Status.PENDING, PrintRequest.Status.APPROVED];
        if (!cancelableStatus.includes(this._status)) {
            throw new PrintRequestCannotBeCancelledError();
        }

        this._status = PrintRequest.Status.CANCELLED;
        this._updatedAt = new Date();
        this.addDomainEvent(new PrintRequestCancelledEvent(this));
    }

    adminCancel(reason: string): void {
        // O admin pode cancelar até durante a produção; depois de pronto, só entregar ou descartar.
        const cancelableStatus = [
            PrintRequest.Status.PENDING,
            PrintRequest.Status.APPROVED,
            PrintRequest.Status.IN_PRODUCTION,
        ];
        if (!cancelableStatus.includes(this._status)) {
            throw new PrintRequestCannotBeCancelledError();
        }
        this._status = PrintRequest.Status.CANCELLED;
        this._rejectionCancelReason = PrintRequest.ensureReason(reason);
        this._updatedAt = new Date();
        this.addDomainEvent(new PrintRequestCancelledEvent(this));
    }

    checkOwner(userId: UniqueId): void {
        if (!this.userId.equals(userId)) {
            throw new ForbiddenPrintRequestAccessError(this.id);
        }
    }

    /** Motivo é obrigatório nas ações que o exigem — validação de domínio, não do schema. */
    private static ensureReason(reason: string): string {
        const trimmed = reason.trim();
        if (!trimmed) {
            throw new PrintRequestReasonRequiredError();
        }
        return trimmed;
    }

    toJSON(): PrintRequest.JsonSchema {
        return {
            id: this.id.toJSON(),
            userId: this.userId.value,
            printerId: this._printerId ? this._printerId.value : null,
            purpose: this.purpose,
            stlFileId: this.stlFileId.toJSON(),
            gcodeFileId: this.gcodeFileId.toJSON(),
            filamentId: this.filamentId.toJSON(),
            status: this._status,
            rejectionCancelReason: this._rejectionCancelReason,
            createdAt: this._createdAt.toISOString(),
            updatedAt: this._updatedAt.toISOString(),
        };
    }
}

export namespace PrintRequest {
    export enum Status {
        PENDING = "pending",
        APPROVED = "approved",
        IN_PRODUCTION = "in_production",
        COMPLETED = "completed",
        DELIVERED = "delivered",
        DISCARDED = "discarded",
        REJECTED = "rejected",
        CANCELLED = "cancelled",
    }

    export const StatusSchema = z.enum(Status);

    export const JsonSchema = z.object({
        id: z.string(),
        userId: z.string(),
        printerId: z.string().nullable(),
        purpose: z.string(),
        stlFileId: UniqueId.JsonSchema,
        gcodeFileId: UniqueId.JsonSchema,
        filamentId: UniqueId.JsonSchema,
        status: StatusSchema,
        rejectionCancelReason: z.string().nullable(),
        createdAt: z.string(),
        updatedAt: z.string(),
    });

    export type CreateParams = {
        userId: UniqueId;
        purpose: string;
        stlFileId: UniqueId;
        gcodeFileId: UniqueId;
        filamentId: UniqueId;
    };

    export type JsonSchema = z.infer<typeof JsonSchema>;
}
