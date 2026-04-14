import { AggregateRoot } from "./aggregate-root";
import { IDomainEvent } from "./domain-event";
import { UniqueId } from "./unique-id";

export type EventHandler<T extends IDomainEvent = IDomainEvent> = (event: T) => void | Promise<void>;

export class DomainEvents {
    private static handlersMap = new Map<string, EventHandler<any>[]>();
    private static markedAggregates: AggregateRoot[] = [];

    /**
     * Called by aggregate root to notify the dispatcher that it has new events ready to be dispatched
     * when the aggregate is saved to the database.
     */
    public static markAggregateForDispatch(aggregate: AggregateRoot): void {
        const aggregateFound = !!this.findMarkedAggregateByID(aggregate.id);
        if (!aggregateFound) {
            this.markedAggregates.push(aggregate);
        }
    }

    private static findMarkedAggregateByID(id: UniqueId): AggregateRoot | undefined {
        return this.markedAggregates.find((a) => a.id.equals(id));
    }

    /**
     * Dispatch events for a specific aggregate root directly.
     * This should typically be called directly from repository `save()` methods.
     */
    public static dispatchEventsForAggregate(id: UniqueId): void {
        const aggregate = this.findMarkedAggregateByID(id);
        if (aggregate) {
            this.dispatchAggregateEvents(aggregate);
            aggregate.clearEvents();
            this.removeAggregateFromMarkedDispatchList(aggregate);
        }
    }

    private static removeAggregateFromMarkedDispatchList(aggregate: AggregateRoot): void {
        const index = this.markedAggregates.findIndex((a) => a.equals(aggregate));
        if (index !== -1) {
            this.markedAggregates.splice(index, 1);
        }
    }

    private static dispatchAggregateEvents(aggregate: AggregateRoot): void {
        aggregate.domainEvents.forEach((event: IDomainEvent) => {
            const eventClassName = event.constructor.name;
            const handlers = this.handlersMap.get(eventClassName) || [];

            // Fire and forget asynchronous handler execution to prevent blocking the main thread
            handlers.forEach((handler) => {
                setTimeout(async () => {
                    try {
                        await handler(event);
                    } catch (err) {
                        console.error(`[DomainEvents] Error dispatching event ${eventClassName}:`, err);
                    }
                }, 0);
            });
        });
    }

    public static register<T extends IDomainEvent>(handler: EventHandler<T>, eventClassName: string): void {
        if (!this.handlersMap.has(eventClassName)) {
            this.handlersMap.set(eventClassName, []);
        }
        this.handlersMap.get(eventClassName)!.push(handler as EventHandler<any>);
    }

    public static clearHandlers(): void {
        this.handlersMap.clear();
    }

    public static clearMarkedAggregates(): void {
        this.markedAggregates = [];
    }
}
