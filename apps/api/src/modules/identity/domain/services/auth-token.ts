import { User } from "src/modules/identity/domain/entities";
import { AuthToken } from "../value-objects/auth-token";

export interface AuthTokenService {
    generateToken(user: User): Promise<AuthToken>;
    verify(token: AuthToken): Promise<User | null>;
}