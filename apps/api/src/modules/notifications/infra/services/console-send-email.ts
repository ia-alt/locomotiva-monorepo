import { SendEmailService } from "@notifications/application/services";

export class ConsoleSendEmailService implements SendEmailService {
    async send(): Promise<void> {
        console.log('email enviado');
    }
}
