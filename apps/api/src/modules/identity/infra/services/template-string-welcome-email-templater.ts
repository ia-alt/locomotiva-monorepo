import { WelcomeEmailTemplater } from "src/modules/identity/domain/services/welcome-email-templater";
import { User } from "src/modules/identity/domain/entities";

export class TemplateStringWelcomeEmailTemplater implements WelcomeEmailTemplater {
    template(params: { user: User }): Promise<string> {
        return Promise.resolve(`
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 24px;">
                <img src="cid:logo@locomotiva" alt="Locomotiva Hub" style="height: 64px;" />
            </div>
            <h2 style="color: #333;">Bem-vindo ao Locomotiva Hub!</h2>
            <p>Olá, <strong>${params.user.firstName}</strong>!</p>
            <p>Seu cadastro foi realizado com sucesso. Agora você faz parte do <strong>Locomotiva Hub</strong> e já pode acessar sua conta e usufruir do espaço.</p>
            <p>Se você não realizou este cadastro, entre em contato com o suporte.</p>
            <p>Atenciosamente,<br/>Equipe Locomotiva</p>
        </div>
        `);
    }
}
