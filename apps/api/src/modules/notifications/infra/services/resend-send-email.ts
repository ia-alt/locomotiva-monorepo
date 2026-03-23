import { Resend } from 'resend';
import { SendEmailService } from "@notifications/application/services";

export class ResendSendEmailService implements SendEmailService {
    private readonly resend: Resend;

    constructor(apiKey: string) {
        this.resend = new Resend(apiKey);
    }

    async send(to: string, subject: string, html: string): Promise<void> {
        await this.resend.emails.send({
            from: 'onboarding@resend.dev',
            to,
            subject,
            html,
        });
    }
}
