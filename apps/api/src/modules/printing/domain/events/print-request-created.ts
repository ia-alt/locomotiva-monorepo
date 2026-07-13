import { IDomainEvent, UniqueId } from "@core/base-classes";
import { PrintRequest } from "../entities/print-request";

export class PrintRequestCreatedEvent implements IDomainEvent {
    public dateTimeOccurred: Date;
    public printRequest: PrintRequest;

    constructor(printRequest: PrintRequest) {
        this.dateTimeOccurred = new Date();
        this.printRequest = printRequest;
    }

    getAggregateId(): UniqueId {
        return this.printRequest.id;
    }
}
