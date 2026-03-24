import { Entity } from "./entity";
import { IDomainEvent } from "./domain-event";
import { DomainEvents } from "./domain-events";

export abstract class AggregateRoot extends Entity {
    private _domainEvents: IDomainEvent[] = [];

    get domainEvents(): IDomainEvent[] {
        return this._domainEvents;
    }

    protected addDomainEvent(domainEvent: IDomainEvent): void {
        this._domainEvents.push(domainEvent);
        DomainEvents.markAggregateForDispatch(this);
    }

    public clearEvents(): void {
        this._domainEvents = [];
    }
}
