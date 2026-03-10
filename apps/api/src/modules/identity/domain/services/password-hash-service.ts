export interface PasswordHashService {
    check(password: string, passwordHash: string): Promise<boolean>;
    hash(password: string): Promise<string>;
}