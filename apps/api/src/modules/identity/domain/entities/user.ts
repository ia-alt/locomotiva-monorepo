import { AggregateRoot, UniqueId } from "@core/base-classes";
import { randomInt } from "node:crypto";
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
        private _passwordHash: string | null,
        private _lastPasswordResetDate: Date,
        private _passwordResetCode: string | null = null,
        private _passwordResetCodeExpiry: Date | null = null,
        private _company: string | null = null,
        private _jobTitle: string | null = null,
        private _phone: string | null = null,
        private _authProvider: User.AuthProvider = User.AuthProvider.LOCAL,
        private _govbrSub: string | null = null,
    ) {
        super(id);
    }

    get authProvider() {
        return this._authProvider;
    }

    /** `sub` bruto do id_token do gov.br. Nunca expor em resposta de API. */
    get govbrSub() {
        return this._govbrSub;
    }

    /** Conta federada não tem senha nesta aplicação — o gov.br é a fonte de autenticação. */
    hasLocalPassword(): boolean {
        return this._passwordHash !== null;
    }

    get firstName() {
        return this._name.split(' ')[0];
    }

    get company() {
        return this._company;
    }

    get jobTitle() {
        return this._jobTitle;
    }

    get phone() {
        return this._phone;
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
            null,
            props.company ?? null,
            props.jobTitle ?? null,
            props.phone,
        );
        user.addDomainEvent(new UserRegisteredEvent(user));
        return user;
    }

    /**
     * Cria usuário autenticado pelo Login Único gov.br: sem senha local.
     *
     * `birthDate` continua obrigatório porque o gov.br não o fornece — o chamador
     * só invoca este método DEPOIS da etapa "complete seu cadastro". Nunca criar
     * a linha com data placeholder: `prisma-user.ts` revalida `BirthDate` em toda
     * leitura, e um valor inválido derruba consultas de todos os usuários.
     *
     * `userType` é fixado em USER: privilégio nunca vem de claim do provedor.
     */
    static createFederated(props: User.CreateFederatedParams): User {
        const user = new User(
            UniqueId.create(),
            props.name,
            props.email,
            props.cpf,
            props.birthDate,
            User.UserType.USER,
            null,
            new Date(),
            null,
            null,
            props.company ?? null,
            props.jobTitle ?? null,
            props.phone ?? null,
            User.AuthProvider.GOVBR,
            props.govbrSub,
        );
        user.addDomainEvent(new UserRegisteredEvent(user));
        return user;
    }

    /**
     * Vincula uma identidade gov.br a esta conta já existente.
     *
     * A senha local PERMANECE: decisão de produto (2026-08-07) — a pessoa
     * escolhe entrar com senha ou com gov.br, e é isso que permite a um admin
     * vincular sem se trancar fora do painel, que só aceita senha.
     *
     * Quem chama é responsável por já ter exigido prova de posse da conta.
     */
    linkGovbrIdentity(govbrSub: string): void {
        this._govbrSub = govbrSub;
        this._authProvider = User.AuthProvider.GOVBR;
    }

    update(data: User.UpdateParams): void {
        this._name = data.name;
        this.email = EmailAddress.fromString(data.email);
        this.cpf = Cpf.fromString(data.cpf);
        this.birthDate = BirthDate.fromJSON(data.birthDate);
        this._userType = data.userType;
        this._company = data.company ?? null;
        this._jobTitle = data.jobTitle ?? null;
        this._phone = data.phone;
    }

    updateSelf(data: { name: string; email: EmailAddress; birthDate: BirthDate; company?: string | null; jobTitle?: string | null; phone: string  }): void {
        this._name = data.name;
        this.email = data.email;
        this.birthDate = data.birthDate;
        this._company = data.company ?? null;
        this._jobTitle = data.jobTitle ?? null;
        this._phone = data.phone ;
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
        // CSPRNG: Math.random é previsível o bastante para reduzir o espaço de
        // busca de um código que autoriza troca de senha.
        const code = randomInt(100000, 1000000).toString();
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
            company: this._company,
            jobTitle: this._jobTitle,
            phone: this._phone,
            // Os clientes precisam disto para esconder "alterar senha" em conta gov.br.
            // `govbrSub` NÃO entra aqui de propósito.
            authProvider: this._authProvider,
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
    export enum AuthProvider {
        LOCAL = "local",
        GOVBR = "govbr",
    }
    export type CreateFederatedParams = {
        name: string;
        email: EmailAddress;
        cpf: Cpf;
        birthDate: BirthDate;
        govbrSub: string;
        company?: string | null;
        jobTitle?: string | null;
        phone?: string | null;
    };
    export type CreateParams = {
        name: string;
        email: EmailAddress;
        cpf: Cpf;
        birthDate: BirthDate;
        passwordHash: string;
        company?: string | null;
        jobTitle?: string | null;
        phone: string;
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
        company: z.string().nullable().optional(),
        jobTitle: z.string().nullable().optional(),
        phone: z.string(),
    });
    export type UpdateParams = z.infer<typeof UpdateSchema>;
    export const JsonSchema = z.object({
        id: z.string(),
        name: z.string(),
        email: EmailAddress.JsonSchema,
        cpf: Cpf.JsonSchema,
        birthDate: BirthDate.JsonSchema,
        userType: z.enum(UserType),
        company: z.string().nullable().optional(),
        jobTitle: z.string().nullable().optional(),
        phone: z.string().nullable(),
        authProvider: z.enum(AuthProvider),
        passwordResetCode: z.string().nullable().optional(),
        passwordResetCodeExpiry: z.date().nullable().optional(),
    });
    export type JsonSchema = z.infer<typeof JsonSchema>;
}

export { User };
