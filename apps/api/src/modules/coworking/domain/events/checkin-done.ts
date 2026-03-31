import { IDomainEvent, UniqueId } from "@core/base-classes";
import { AccessLog } from "../entities";

export class CheckinDoneEvent implements IDomainEvent {
    public dateTimeOccurred: Date;
    public readonly accessLog: AccessLog;

    constructor(accessLog: AccessLog) {
        this.dateTimeOccurred = new Date();
        this.accessLog = accessLog;
    }

    getAggregateId(): UniqueId {
        return this.accessLog.id;
    }
}