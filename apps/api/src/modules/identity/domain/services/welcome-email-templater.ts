import { User } from "src/modules/identity/domain/entities";

export interface WelcomeEmailTemplater {
    template(params: { user: User }): Promise<string>;
}
