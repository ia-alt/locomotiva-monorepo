import { PasswordResetEmailTemplater } from "src/modules/identity/domain/services";
import { User } from "src/modules/identity/domain/entities";
import { env } from "@env";

export class TemplateStringPasswordResetEmailTemplater implements PasswordResetEmailTemplater {
    template(params: {
        user: User;
        token: string;
    }): Promise<string> {
        const resetLink = `${env.RESET_PASSWORD_URL_BASE}?token=${params.token}`;

        return Promise.resolve(`<h1>Redefinição de Senha</h1>
        <p>Olá ${params.user.firstName},</p>
        <p>Você solicitou a redefinição de sua senha.</p>
        <p>Clique no link abaixo para redefinir sua senha:</p>
        <a href="${resetLink}">Redefinir Senha</a>
        <p>Este link expira em 1 hora.</p>
        <p>Se você não solicitou isso, ignore este e-mail.</p>
        <p>Atenciosamente,</p>
        <p>Equipe Locomotiva</p>
        `);
    }
}
