import { UniqueId } from "./unique-id";

export interface IDomainEvent {
    dateTimeOccurred: Date;
    getAggregateId(): UniqueId;
}
