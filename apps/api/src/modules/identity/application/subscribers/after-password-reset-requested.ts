import { DomainEvents } from "@core/base-classes";
import { PasswordResetRequestedEvent } from "../../domain/events/password-reset-requested";
import { SendEmailService } from "@notifications/application/services";
import { PasswordResetEmailTemplater } from "../../domain/services";

export class AfterPasswordResetRequested {
    constructor(
        private readonly sendEmailService: SendEmailService,
        private readonly emailTemplater: PasswordResetEmailTemplater,
    ) {
        this.setupSubscriptions();
    }

    private setupSubscriptions(): void {
        DomainEvents.register(this.onPasswordResetRequested.bind(this), PasswordResetRequestedEvent.name);
    }

    private async onPasswordResetRequested(event: PasswordResetRequestedEvent): Promise<void> {
        try {
            const html = await this.emailTemplater.template({
                user: event.user,
                token: event.resetToken
            });

            await this.sendEmailService.send(
                event.user.email.toString(),
                "Recuperação de senha",
                html,
            );
            console.log(`[AfterPasswordResetRequested] Password reset email queued successfully for ${event.user.email.toString()}.`);
        } catch (error) {
            console.error(`[AfterPasswordResetRequested] Failed to send password reset email to ${event.user.email.toString()}.`, error);
        }
    }
}
