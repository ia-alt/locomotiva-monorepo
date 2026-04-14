import { PasswordResetCodeEmailTemplater } from "src/modules/identity/domain/services/password-reset-code-email-templater";
import { User } from "src/modules/identity/domain/entities";

export class TemplateStringPasswordResetCodeEmailTemplater implements PasswordResetCodeEmailTemplater {
    template(params: { user: User; code: string }): Promise<string> {
        return Promise.resolve(`
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 24px;">
                <img src="cid:logo@locomotiva" alt="Locomotiva Hub" style="height: 64px;" />
            </div>
            <h2 style="color: #333;">Recuperação de Senha</h2>
            <p>Olá, <strong>${params.user.firstName}</strong>!</p>
            <p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>Locomotiva Hub</strong>.</p>
            <p>Use o código abaixo no aplicativo para continuar:</p>
            <div style="background: #f4f4f4; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
                <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1a1a1a;">${params.code}</span>
            </div>
            <p style="color: #666; font-size: 14px;">Este código expira em <strong>15 minutos</strong>.</p>
            <p style="color: #666; font-size: 14px;">Se você não solicitou a redefinição de senha, ignore este e-mail.</p>
            <p>Atenciosamente,<br/>Equipe Locomotiva</p>
        </div>
        `);
    }
}
