import { User } from "../entities";
import { InvalidCredentialsError, InvalidOrExpiredTokenError } from "../errors";
import { Password } from "../value-objects/password";
import { PasswordHashService } from "./password-hash-service";
import { UserRepository } from "../repositories";
import { EmailAddress } from "@core/value-objects";
import { Cpf } from "src/modules/identity/domain/value-objects/cpf";
import { PasswordResetTokenService } from "./password-reset-token";

export class PasswordService {
    constructor(
        private readonly passwordHashService: PasswordHashService,
        private readonly userRepository: UserRepository,
        private readonly passwordResetTokenService: PasswordResetTokenService,
    ) { }

    async changePassword(params: { user: User, currentPassword: string, newPassword: Password }) {
        const isCurrentValid = await this.passwordHashService.check(params.currentPassword, params.user.getPasswordHash());
        if (!isCurrentValid) {
            throw new InvalidCredentialsError();
        }

        const newHash = await this.passwordHashService.hash(params.newPassword.value);

        params.user.updatePassword(newHash);

        await this.userRepository.save(params.user);
    }

    async requestResetPassword(params: { email: EmailAddress }) {
        const user = await this.userRepository.findByEmailOrCpf(params.email);

        if (!user) {
            return;
        }

        const token = await this.passwordResetTokenService.generate(user);

        user.requestPasswordReset(token);
        await this.userRepository.save(user);
    }

    async executeResetPassword(params: { token: string, newPassword: Password }) {
        const verification = await this.passwordResetTokenService.verify(params.token);
        if (!verification) {
            throw new InvalidOrExpiredTokenError();
        }

        const user = await this.userRepository.findById(verification.userId);
        if (!user) {
            throw new InvalidOrExpiredTokenError();
        }

        const lastReset = user.getLastPasswordResetDate();
        if (lastReset > verification.createdAt) {
            throw new InvalidOrExpiredTokenError();
        }

        const newHash = await this.passwordHashService.hash(params.newPassword.value);

        user.updatePassword(newHash);
        await this.userRepository.save(user);
    }

    async requestResetPasswordWithCode(params: { cpf: string }): Promise<{ maskedEmail: string } | null> {
        const user = await this.userRepository.findByEmailOrCpf(Cpf.fromString(params.cpf));

        if (!user) {
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
        if (!user) return false;

        return user.verifyPasswordResetCode(params.code);
    }

    async executeResetPasswordWithCode(params: { cpf: string, code: string, newPassword: Password }): Promise<boolean> {
        const user = await this.userRepository.findByEmailOrCpf(Cpf.fromString(params.cpf));
        if (!user) return false;

        if (!user.verifyPasswordResetCode(params.code)) {
            return false;
        }

        const newHash = await this.passwordHashService.hash(params.newPassword.value);

        user.updatePassword(newHash);
        await this.userRepository.save(user);

        return true;
    }
}