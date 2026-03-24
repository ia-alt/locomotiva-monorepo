import { AggregateRoot, UniqueId } from "@core/base-classes";
import { UserRegisteredEvent } from "../events/user-registered";
import { PasswordResetRequestedEvent } from "../events/password-reset-requested";
import z from "zod";
import { EmailAddress } from "@core/value-objects";
import { Cpf } from "src/modules/identity/domain/value-objects/cpf";
import { BirthDate } from "src/modules/identity/domain/value-objects/birth-date";
import { SystemHasCpfOrUserNotHaveCpf } from "../errors";

class User extends AggregateRoot {

    constructor(
        id: UniqueId,
        private _name: string,
        public email: EmailAddress,
        public cpf: Cpf | null,
        public birthDate: BirthDate,
        private _userType: User.UserType,
        private _passwordHash: string,
        private _lastPasswordResetDate: Date,

    ) {
        if ((_userType === User.UserType.SYSTEM) === (cpf !== null)) {
            throw new SystemHasCpfOrUserNotHaveCpf()
        }
        super(id);
    }

    get firstName() {
        return this._name.split(' ')[0];
    }

    static create(props: User.CreateParams): User {
        const user = new User(
            UniqueId.create(),
            props.name,
            props.email,
            props.cpf,
            props.birthDate,
            User.UserType.USER,
            props.passwordHash,
            new Date(),
        );
        user.addDomainEvent(new UserRegisteredEvent(user));
        return user;
    }

    static createSystem(props: User.CreateSystemParams): User {
        const user = new User(
            UniqueId.create(),
            props.name,
            props.email,
            null,
            props.birthDate,
            User.UserType.SYSTEM,
            props.passwordHash,
            new Date(),
        );
        user.addDomainEvent(new UserRegisteredEvent(user));
        return user;
    }

    update(data: User.UpdateParams): void {
        this._name = data.name;
        this.email = EmailAddress.fromString(data.email);
        this.cpf = Cpf.fromString(data.cpf);
        this.birthDate = BirthDate.fromJSON(data.birthDate);
        this._userType = data.userType;
    }

    getPasswordHash() {
        return this._passwordHash;
    }

    getLastPasswordResetDate() {
        return this._lastPasswordResetDate;
    }

    updatePassword(passwordHash: string) {
        this._passwordHash = passwordHash;
        this._lastPasswordResetDate = new Date();
    }

    requestPasswordReset(resetToken: string) {
        this.addDomainEvent(new PasswordResetRequestedEvent(this, resetToken));
    }

    toJSON(): User.JsonSchema {
        return {
            id: this.id.value,
            name: this._name,
            email: this.email.toJSON(),
            cpf: this.cpf?.toJSON(),
            birthDate: this.birthDate.toJSON(),
            userType: this._userType,
        };
    }

    isAdmin() {
        return this._userType === User.UserType.ADMIN;
    }

    isSystem() {
        return this._userType === User.UserType.SYSTEM;
    }


}

namespace User {
    export enum UserType {
        USER = "user",
        ADMIN = "admin",
        SYSTEM = "system",
    }
    export type CreateParams = {
        name: string;
        email: EmailAddress;
        cpf: Cpf;
        birthDate: BirthDate;
        passwordHash: string;
    };
    export type CreateSystemParams = {
        name: string;
        email: EmailAddress;
        birthDate: BirthDate;
        passwordHash: string;
    };
    export const UpdateSchema = z.object({
        name: z.string(),
        email: EmailAddress.JsonSchema,
        cpf: Cpf.JsonSchema,
        birthDate: BirthDate.JsonSchema,
        userType: z.enum(UserType),
    });
    export type UpdateParams = z.infer<typeof UpdateSchema>;
    export const JsonSchema = z.object({
        id: z.string(),
        name: z.string(),
        email: EmailAddress.JsonSchema,
        cpf: Cpf.JsonSchema.nullable().optional(),
        birthDate: BirthDate.JsonSchema,
        userType: z.enum(UserType),
    });
    export type JsonSchema = z.infer<typeof JsonSchema>;
}

export { User };
