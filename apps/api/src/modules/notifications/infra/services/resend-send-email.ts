import nodemailer from 'nodemailer';
import { SendEmailService } from "@notifications/application/services";

export class NodemailerSendEmailService implements SendEmailService {
    private readonly transporter: nodemailer.Transporter;

    constructor(private readonly user: string, pass: string) {
        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: { user, pass },
        });

        this.transporter.verify().then(() => {
            console.log('[Email] Conexão SMTP OK');
        }).catch((err) => {
            console.error('[Email] Falha na conexão SMTP:', err.message);
        });
    }

    async send(to: string, subject: string, html: string): Promise<void> {
        await this.transporter.sendMail({
            from: `"Locomotiva Hub" <${this.user}>`,
            to,
            subject,
            html,
        });
    }
}
