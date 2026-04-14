import { IDomainEvent, UniqueId } from "@core/base-classes";
import { User } from "../entities/user";

export class UserRegisteredEvent implements IDomainEvent {
    public dateTimeOccurred: Date;
    public user: User;

    constructor(user: User) {
        this.dateTimeOccurred = new Date();
        this.user = user;
    }

    getAggregateId(): UniqueId {
        return this.user.id;
    }
}
