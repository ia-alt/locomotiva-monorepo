import { IDomainEvent, UniqueId } from "@core/base-classes";
import { PrintRequest } from "../entities/print-request";

export class PrintRequestRejectedEvent implements IDomainEvent {
    public dateTimeOccurred: Date;
    public printRequest: PrintRequest;
    public reason: string;

    constructor(printRequest: PrintRequest, reason: string) {
        this.dateTimeOccurred = new Date();
        this.printRequest = printRequest;
        this.reason = reason;
    }

    getAggregateId(): UniqueId {
        return this.printRequest.id;
    }
}
