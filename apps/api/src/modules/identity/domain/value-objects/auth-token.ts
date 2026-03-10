import { ValueObject } from "@core/base-classes";
import z from "zod";


class AuthToken extends ValueObject<AuthToken.Value> {
    private constructor(value: AuthToken.Value) {
        super(value);
    }

    static fromString(value: string): AuthToken {
        let cleanValue = value.trim();
        // Remove aspas do inicio e fim se existirem (funciona para "token", 'token', "token ou token")
        cleanValue = cleanValue.replace(/^['"]+|['"]+$/g, '');
        return new AuthToken(cleanValue);
    }

    toJSON(): string {
        return this.value;
    }

    toString(): string {
        return this.value;
    }
}

namespace AuthToken {
    export const ValueSchema = z.string();
    export type Value = z.infer<typeof ValueSchema>;
}

export { AuthToken };
