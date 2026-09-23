import { UniqueId } from "@core/base-classes";
import { AuthTokenService } from "src/modules/identity/domain/services";
import { User } from "src/modules/identity/domain/entities";
import { UserRepository } from "src/modules/identity/domain/repositories";
import jwt from "jsonwebtoken";
import { AuthToken } from "src/modules/identity/domain/value-objects/auth-token";
import { env } from "@env";

export class JwtAuthTokenService implements AuthTokenService {
    private readonly secret: string;
    private readonly expiresInSeconds: number;

    constructor(
        private readonly userRepository: UserRepository
    ) {
        this.secret = env.AUTH_JWT_SECRET;
        // Curto de propósito: este token não é revogável, então a janela em que
        // um valor vazado funciona precisa ser pequena. A sessão longa fica com
        // o RefreshTokenService, que sabe revogar.
        this.expiresInSeconds = env.AUTH_ACCESS_TOKEN_TTL_SECONDS;
    }

    async verify(token: AuthToken): Promise<User | null> {
        try {
            const decoded = jwt.verify(token.value, this.secret) as {
                sub: string;
                email: string;
            };
            const userId = UniqueId.fromString(decoded.sub);
            const user = await this.userRepository.findById(userId);

            if (!user) {
                return null;
            }

            return user;
        } catch {
            return null;
        }
    }

    async generateToken(user: User): Promise<AuthToken> {
        return AuthToken.fromString(jwt.sign(
            {
                sub: user.id.value,
                email: user.email.toString(),
            },
            this.secret,
            { expiresIn: this.expiresInSeconds } as jwt.SignOptions
        ));
    }
}
