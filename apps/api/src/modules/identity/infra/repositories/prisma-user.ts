import { UserRepository } from "src/modules/identity/domain/repositories";
import { User } from "src/modules/identity/domain/entities";
import { Prisma, PrismaClient, User as UserDb } from "@core/infra/database/prisma";
import { UniqueId, DomainEvents } from "@core/base-classes";
import { EmailAddress, PaginatedQuery, PaginatedResult } from "@core/value-objects";
import { Cpf } from "src/modules/identity/domain/value-objects/cpf";
import { BirthDate } from "src/modules/identity/domain/value-objects/birth-date";

export class PrismaUserRepository implements UserRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async findById(id: UniqueId): Promise<User | null> {
        const user = await this.prisma.user.findUnique({ where: { id: id.value } });
        if (!user) return null;
        return this.userDbToEntity(user);
    }

    async save(user: User): Promise<void> {
        const json = user.toJSON();
        await this.prisma.user.upsert({
            where: { id: json.id },
            update: {
                name: json.name,
                email: json.email,
                cpf: json.cpf,
                birthDate: new Date(json.birthDate),
                userType: json.userType,
                company: json.company ?? null,
                jobTitle: json.jobTitle ?? null,
                passwordHash: user.getPasswordHash(),
                lastPasswordResetDate: user.getLastPasswordResetDate(),
                passwordResetCode: user.getPasswordResetCode(),
                passwordResetCodeExpiry: user.getPasswordResetCodeExpiry(),
            },
            create: {
                id: json.id,
                name: json.name,
                email: json.email,
                cpf: json.cpf,
                birthDate: new Date(json.birthDate),
                userType: json.userType,
                company: json.company ?? null,
                jobTitle: json.jobTitle ?? null,
                passwordHash: user.getPasswordHash(),
                lastPasswordResetDate: user.getLastPasswordResetDate(),
                passwordResetCode: user.getPasswordResetCode(),
                passwordResetCodeExpiry: user.getPasswordResetCodeExpiry(),
            },
        });
        DomainEvents.dispatchEventsForAggregate(user.id);
    }

    async findManyByIds(ids: UniqueId[]): Promise<User[]> {
        const users = await this.prisma.user.findMany({
            where: {
                id: { in: ids.map(id => id.value) },
            },
        });
        return users.map(user => this.userDbToEntity(user));
    }

    async findByEmailOrCpf(emailOrCpf: EmailAddress | Cpf): Promise<User | null> {
        let where: Prisma.UserWhereInput;

        if (emailOrCpf instanceof EmailAddress) {
            where = { email: emailOrCpf.toString() };
        } else {
            where = { cpf: emailOrCpf.value };
        }

        const user = await this.prisma.user.findFirst({ where });
        if (!user) return null;
        return this.userDbToEntity(user);
    }

    async delete(id: UniqueId): Promise<void> {
        await this.prisma.user.delete({ where: { id: id.value } });
        DomainEvents.dispatchEventsForAggregate(id);
    }

    async findAll(pagination: PaginatedQuery, search?: string): Promise<PaginatedResult<typeof User.JsonSchema, User>> {
        const { take, skip } = pagination.asTakeSkip;
        const where = search
            ? { OR: [
                { name: { contains: search, mode: 'insensitive' as const } },
                { email: { contains: search, mode: 'insensitive' as const } },
            ]}
            : undefined;
        const [usersDb, total] = await Promise.all([
            this.prisma.user.findMany({ where, orderBy: { name: 'asc' }, take, skip }),
            this.prisma.user.count({ where }),
        ]);
        const items = usersDb.map(u => this.userDbToEntity(u));
        return PaginatedResult.create({ items, total, paginatedQuery: pagination });
    }

    userDbToEntity(user: UserDb): User {
        return new User(
            UniqueId.fromString(user.id),
            user.name,
            EmailAddress.fromString(user.email),
            Cpf.fromString(user.cpf),
            BirthDate.fromDate(user.birthDate),
            user.userType as User.UserType,
            user.passwordHash,
            user.lastPasswordResetDate,
            user.passwordResetCode,
            user.passwordResetCodeExpiry,
            (user as any).company ?? null,
            (user as any).jobTitle ?? null,
        );
    }
}
