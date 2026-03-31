import { User } from "src/modules/identity/domain/entities";

export interface PasswordResetCodeEmailTemplater {
    template(params: { user: User; code: string }): Promise<string>;
}
