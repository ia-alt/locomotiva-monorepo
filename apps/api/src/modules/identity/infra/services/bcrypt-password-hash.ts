import { PasswordHashService } from "src/modules/identity/domain/services";
import bcrypt from "bcrypt";

export class BcryptPasswordHashService implements PasswordHashService {
    private readonly saltRounds = 10;

    async check(password: string, passwordHash: string): Promise<boolean> {
        return bcrypt.compare(password, passwordHash);
    }

    async hash(password: string): Promise<string> {
        return bcrypt.hash(password, this.saltRounds);
    }
}
