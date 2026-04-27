import { EmailAddress } from "@core/value-objects";
import { Cpf } from "../value-objects/cpf";
import { UserRepository } from "../repositories";
import { InvalidCredentialsError, UserAlreadyExistsWithEmailOrCpfError } from "../errors";
import { AuthTokenService } from "./auth-token";
import { PasswordHashService } from "./password-hash-service";
import { AuthToken } from "../value-objects/auth-token";
import { User } from "../entities";
import { Password } from "../value-objects/password";
import { BirthDate } from "../value-objects/birth-date";

class AuthService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly passwordHashService: PasswordHashService,
        private readonly authTokenService: AuthTokenService,
    ) { }

    async login(emailOrCpf: EmailAddress | Cpf, password: string): Promise<AuthToken> {
        const user = await this.userRepository.findByEmailOrCpf(emailOrCpf);
        if (!user) {
            throw new InvalidCredentialsError();
        }

        const passwordOk = await this.passwordHashService.check(password, user.getPasswordHash());
        if (!passwordOk) {
            throw new InvalidCredentialsError();
        }

        const token = await this.authTokenService.generateToken(user);

        return token;
    }

    async register(params: AuthService.RegisterParams): Promise<User> {
        const existingByEmail = await this.userRepository.findByEmailOrCpf(params.email);
        if (existingByEmail) {
            throw new UserAlreadyExistsWithEmailOrCpfError();
        }

        const existingByCpf = await this.userRepository.findByEmailOrCpf(params.cpf);
        if (existingByCpf) {
            throw new UserAlreadyExistsWithEmailOrCpfError();
        }

        const passwordHash = await this.passwordHashService.hash(params.password.value);

        const user = User.create({
            name: params.name,
            email: params.email,
            cpf: params.cpf,
            birthDate: params.birthDate,
            passwordHash,
            company: params.company,
            jobTitle: params.jobTitle,
        });

        await this.userRepository.save(user);
        return user;
    }
}

namespace AuthService {
    export type RegisterParams = {
        name: string;
        email: EmailAddress;
        cpf: Cpf;
        birthDate: BirthDate;
        password: Password;
        company?: string | null;
        jobTitle?: string | null;
    };
}

export { AuthService };
