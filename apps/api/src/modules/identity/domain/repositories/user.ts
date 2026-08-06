import { UniqueId } from "@core/base-classes";
import { User } from "../entities";
import { EmailAddress, PaginatedQuery, PaginatedResult } from "@core/value-objects";
import { Cpf } from "../value-objects/cpf";

export interface UserRepository {
    findById(id: UniqueId): Promise<User | null>;
    save(user: User): Promise<void>;
    findManyByIds(ids: UniqueId[]): Promise<User[]>;
    findByEmailOrCpf(emailOrCpf: EmailAddress | Cpf): Promise<User | null>;
    /** Busca pelo `sub` do gov.br — a chave de identidade federada. */
    findByGovbrSub(govbrSub: string): Promise<User | null>;
    findManyByName(name: string): Promise<User[]>;
    findAll(pagination: PaginatedQuery, search?: string): Promise<PaginatedResult<typeof User.JsonSchema, User>>;
    delete(id: UniqueId): Promise<void>;
}
