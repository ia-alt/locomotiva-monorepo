import { PasswordResetTokenService } from "src/modules/identity/domain/services";
import { User } from "src/modules/identity/domain/entities";
import { UniqueId } from "@core/base-classes";
import jwt from "jsonwebtoken";
import { env } from "@env";

export class JwtPasswordResetTokenService implements PasswordResetTokenService {
    private readonly secret: string;
    private readonly expiresIn: string;

    constructor() {
        this.secret = env.RESET_PASSWORD_JWT_SECRET;
        this.expiresIn = "1h";
    }

    async generate(user: User): Promise<string> {
        return jwt.sign(
            {
                sub: user.id.value,
            },
            this.secret,
            { expiresIn: this.expiresIn } as jwt.SignOptions
        );
    }

    async verify(token: string): Promise<{ userId: UniqueId; createdAt: Date } | null> {
        try {
            const decoded = jwt.verify(token, this.secret) as jwt.JwtPayload;

            if (!decoded.sub || !decoded.iat) {
                return null;
            }

            // JWT 'iat' is in seconds, convert to Date
            const createdAt = new Date(decoded.iat * 1000);

            return {
                userId: UniqueId.fromString(decoded.sub),
                createdAt: createdAt
            };
        } catch {
            return null;
        }
    }
}
