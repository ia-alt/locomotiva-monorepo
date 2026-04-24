import { DomainEvents } from "@core/base-classes";
import { UserRegisteredEvent } from "../../domain/events/user-registered";
import { SendEmailService } from "@notifications/application/services";
import { WelcomeEmailTemplater } from "../../domain/services/welcome-email-templater";

export class AfterUserRegistered {
    constructor(
        private readonly sendEmailService: SendEmailService,
        private readonly emailTemplater: WelcomeEmailTemplater,
    ) {
        this.setupSubscriptions();
    }

    private setupSubscriptions(): void {
        DomainEvents.register(this.onUserRegistered.bind(this), UserRegisteredEvent.name);
    }

    private async onUserRegistered(event: UserRegisteredEvent): Promise<void> {
        try {
            const html = await this.emailTemplater.template({ user: event.user });
            await this.sendEmailService.send(
                event.user.email.toString(),
                "Bem-vindo ao Locomotiva Hub!",
                html,
            );
            console.log(`[AfterUserRegistered] Welcome email sent to ${event.user.email.toString()}.`);
        } catch (error) {
            console.error(`[AfterUserRegistered] Failed to send welcome email to ${event.user.email.toString()}.`, error);
        }
    }
}
