import { Entity, UniqueId } from "@core/base-classes";
import z from "zod";
import { EmailAddress } from "@core/value-objects";
import { Cpf } from "src/modules/identity/domain/value-objects/cpf";
import { BirthDate } from "src/modules/identity/domain/value-objects/birth-date";

class User extends Entity {

    constructor(
        id: UniqueId,
        private readonly name: string,
        public readonly email: EmailAddress,
        public readonly cpf: Cpf,
        public readonly birthDate: BirthDate,
        private readonly userType: User.UserType,
        private _passwordHash: string,
        private _lastPasswordResetDate: Date,

    ) {
        super(id);
    }

    get firstName() {
        return this.name.split(' ')[0];
    }

    static create(props: User.CreateParams): User {
        return new User(
            UniqueId.create(),
            props.name,
            props.email,
            props.cpf,
            props.birthDate,
            User.UserType.USER,
            props.passwordHash,
            new Date(),
        );
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

    toJSON(): User.JsonSchema {
        return {
            id: this.id.value,
            name: this.name,
            email: this.email.toJSON(),
            cpf: this.cpf.toJSON(),
            birthDate: this.birthDate.toJSON(),
            userType: this.userType,
        };
    }

    isAdmin() {
        return this.userType === User.UserType.ADMIN;
    }

    isSystem() {
        return this.userType === User.UserType.SYSTEM;
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
    export const JsonSchema = z.object({
        id: z.string(),
        name: z.string(),
        email: EmailAddress.JsonSchema,
        cpf: Cpf.JsonSchema,
        birthDate: BirthDate.JsonSchema,
        userType: z.enum(UserType),
    });
    export type JsonSchema = z.infer<typeof JsonSchema>;
}

export { User };
