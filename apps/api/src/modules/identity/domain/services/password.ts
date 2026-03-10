import { User } from "../entities";
import { InvalidCredentialsError, InvalidOrExpiredTokenError } from "../errors";
import { Password } from "../value-objects/password";
import { PasswordHashService } from "./password-hash-service";
import { UserRepository } from "../repositories";
import { EmailAddress } from "@core/value-objects";
import { PasswordResetTokenService } from "./password-reset-token";
import { PasswordResetEmailTemplater } from "./password-reset-email-templater";
import { SendEmailService } from "@notifications/application/services";

export class PasswordService {
    constructor(
        private readonly passwordHashService: PasswordHashService,
        private readonly userRepository: UserRepository,
        private readonly passwordResetTokenService: PasswordResetTokenService,
        private readonly passwordResetEmailTemplater: PasswordResetEmailTemplater,
        private readonly sendEmailService: SendEmailService,
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

        const html = await this.passwordResetEmailTemplater.template({
            user,
            token
        });

        await this.sendEmailService.send(
            user.email.toString(),
            "Recuperação de senha",
            html,
        );
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
}