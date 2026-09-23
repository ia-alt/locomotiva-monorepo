import { User } from "../entities";
import { InvalidCredentialsError, NoLocalPasswordError } from "../errors";
import { Password } from "../value-objects/password";
import { PasswordHashService } from "./password-hash-service";
import { UserRepository } from "../repositories";
import { Cpf } from "src/modules/identity/domain/value-objects/cpf";

export class PasswordService {
    constructor(
        private readonly passwordHashService: PasswordHashService,
        private readonly userRepository: UserRepository,
    ) { }

    async changePassword(params: { user: User, currentPassword: string, newPassword: Password }) {
        // Aqui o usuário já está autenticado, então pode receber a razão real.
        const currentHash = params.user.getPasswordHash();
        if (!currentHash) {
            throw new NoLocalPasswordError();
        }

        const isCurrentValid = await this.passwordHashService.check(params.currentPassword, currentHash);
        if (!isCurrentValid) {
            throw new InvalidCredentialsError();
        }

        const newHash = await this.passwordHashService.hash(params.newPassword.value);

        params.user.updatePassword(newHash);

        await this.userRepository.save(params.user);
    }

    async requestResetPasswordWithCode(params: { cpf: string }): Promise<{ maskedEmail: string } | null> {
        const user = await this.userRepository.findByEmailOrCpf(Cpf.fromString(params.cpf));

        if (!user || !user.hasLocalPassword()) {
            return null;
        }

        user.generatePasswordResetCode(15);
        await this.userRepository.save(user);

        const email = user.email.toString();
        const [local, domain] = email.split('@');
        const maskedLocal = local.length <= 2
            ? `${local[0]}*`
            : `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}`;

        return { maskedEmail: `${maskedLocal}@${domain}` };
    }

    async verifyPasswordResetCode(params: { cpf: string, code: string }): Promise<boolean> {
        const user = await this.userRepository.findByEmailOrCpf(Cpf.fromString(params.cpf));
        if (!user || !user.hasLocalPassword()) return false;

        return user.verifyPasswordResetCode(params.code);
    }

    async executeResetPasswordWithCode(params: { cpf: string, code: string, newPassword: Password }): Promise<boolean> {
        const user = await this.userRepository.findByEmailOrCpf(Cpf.fromString(params.cpf));
        if (!user || !user.hasLocalPassword()) return false;

        if (!user.verifyPasswordResetCode(params.code)) {
            return false;
        }

        const newHash = await this.passwordHashService.hash(params.newPassword.value);

        user.updatePassword(newHash);
        await this.userRepository.save(user);

        return true;
    }
}