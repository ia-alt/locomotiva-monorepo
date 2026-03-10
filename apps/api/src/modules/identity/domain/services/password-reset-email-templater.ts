import { User } from "src/modules/identity/domain/entities";

export interface PasswordResetEmailTemplater {
    template(params: {
        user: User;
        token: string;
    }): Promise<string>;
}

