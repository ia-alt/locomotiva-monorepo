import { IDomainEvent, UniqueId } from "@core/base-classes";
import { User } from "../entities/user";

export class PasswordResetRequestedEvent implements IDomainEvent {
    public dateTimeOccurred: Date;
    public user: User;
    public resetToken: string;

    constructor(user: User, resetToken: string) {
        this.dateTimeOccurred = new Date();
        this.user = user;
        this.resetToken = resetToken;
    }

    getAggregateId(): UniqueId {
        return this.user.id;
    }
}