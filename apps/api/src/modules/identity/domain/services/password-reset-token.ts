import { UniqueId } from "@core/base-classes";
import { User } from "src/modules/identity/domain/entities";

export interface PasswordResetTokenService {
    generate(user: User): Promise<string>;
    verify(token: string): Promise<{ userId: UniqueId; createdAt: Date } | null>;
}
