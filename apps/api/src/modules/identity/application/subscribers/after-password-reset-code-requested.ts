import { DomainEvents } from "@core/base-classes";
import { PasswordResetCodeRequestedEvent } from "../../domain/events/password-reset-code-requested";
import { SendEmailService } from "@notifications/application/services";
import { PasswordResetCodeEmailTemplater } from "../../domain/services/password-reset-code-email-templater";

export class AfterPasswordResetCodeRequested {
    constructor(
        private readonly sendEmailService: SendEmailService,
        private readonly emailTemplater: PasswordResetCodeEmailTemplater,
    ) {
        this.setupSubscriptions();
    }

    private setupSubscriptions(): void {
        DomainEvents.register(this.onPasswordResetCodeRequested.bind(this), PasswordResetCodeRequestedEvent.name);
    }

    private async onPasswordResetCodeRequested(event: PasswordResetCodeRequestedEvent): Promise<void> {
        try {
            const html = await this.emailTemplater.template({
                user: event.user,
                code: event.code,
            });

            await this.sendEmailService.send(
                event.user.email.toString(),
                "Código de recuperação de senha",
                html,
            );
            console.log(`[AfterPasswordResetCodeRequested] Code email sent to ${event.user.email.toString()}.`);
        } catch (error) {
            console.error(`[AfterPasswordResetCodeRequested] Failed to send code email to ${event.user.email.toString()}.`, error);
        }
    }
}
