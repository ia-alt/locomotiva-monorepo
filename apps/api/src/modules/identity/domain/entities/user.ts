import { AggregateRoot, UniqueId } from "@core/base-classes";
import { UserRegisteredEvent } from "../events/user-registered";
import { PasswordResetRequestedEvent } from "../events/password-reset-requested";
import { PasswordResetCodeRequestedEvent } from "../events/password-reset-code-requested";
import z from "zod";
import { EmailAddress } from "@core/value-objects";
import { Cpf } from "src/modules/identity/domain/value-objects/cpf";
import { BirthDate } from "src/modules/identity/domain/value-objects/birth-date";

class User extends AggregateRoot {

    constructor(
        id: UniqueId,
        private _name: string,
        public email: EmailAddress,
        public cpf: Cpf,
        public birthDate: BirthDate,
        private _userType: User.UserType,
        private _passwordHash: string,
        private _lastPasswordResetDate: Date,
        private _passwordResetCode: string | null = null,
        private _passwordResetCodeExpiry: Date | null = null,

    ) {
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
            null,
            null
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
        this._passwordResetCode = null;
        this._passwordResetCodeExpiry = null;
    }

    requestPasswordReset(resetToken: string) {
        this.addDomainEvent(new PasswordResetRequestedEvent(this, resetToken));
    }

    getPasswordResetCode(): string | null {
        return this._passwordResetCode;
    }

    getPasswordResetCodeExpiry(): Date | null {
        return this._passwordResetCodeExpiry;
    }

    generatePasswordResetCode(validForMinutes: number = 15): string {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        this._passwordResetCode = code;
        this._passwordResetCodeExpiry = new Date(Date.now() + validForMinutes * 60 * 1000);
        this.addDomainEvent(new PasswordResetCodeRequestedEvent(this, code));
        return code;
    }

    verifyPasswordResetCode(code: string): boolean {
        if (!this._passwordResetCode || !this._passwordResetCodeExpiry) return false;
        if (this._passwordResetCode !== code) return false;
        if (this._passwordResetCodeExpiry < new Date()) return false;
        return true;
    }

    toJSON(): User.JsonSchema {
        return {
            id: this.id.value,
            name: this._name,
            email: this.email.toJSON(),
            cpf: this.cpf.toJSON(),
            birthDate: this.birthDate.toJSON(),
            userType: this._userType,
            passwordResetCode: this._passwordResetCode,
            passwordResetCodeExpiry: this._passwordResetCodeExpiry,
        };
    }

    isAdmin() {
        return this._userType === User.UserType.ADMIN;
    }




}

namespace User {
    export enum UserType {
        USER = "user",
        ADMIN = "admin",
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
        cpf: Cpf.JsonSchema,
        birthDate: BirthDate.JsonSchema,
        userType: z.enum(UserType),
        passwordResetCode: z.string().nullable().optional(),
        passwordResetCodeExpiry: z.date().nullable().optional(),
    });
    export type JsonSchema = z.infer<typeof JsonSchema>;
}

export { User };
