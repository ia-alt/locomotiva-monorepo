import { User } from "src/modules/identity/domain/entities/user";
import { UserNotAdminError } from "../errors";

export class AuthUserService {
    constructor(private readonly user: User) { }

    getUser(): User {
        return this.user;
    }

    checkIsAdmin(): void {
        if (!this.user.isAdmin()) {
            throw new UserNotAdminError();
        }
    }


}