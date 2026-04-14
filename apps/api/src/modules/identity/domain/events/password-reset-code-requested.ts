import { IDomainEvent, UniqueId } from "@core/base-classes";
import { User } from "../entities/user";

export class PasswordResetCodeRequestedEvent implements IDomainEvent {
    public dateTimeOccurred: Date;
    public user: User;
    public code: string;

    constructor(user: User, code: string) {
        this.dateTimeOccurred = new Date();
        this.user = user;
        this.code = code;
    }

    getAggregateId(): UniqueId {
        return this.user.id;
    }
}
