import { ValueObject } from "@core/base-classes";
import z from "zod";
import { UnsafePasswordError } from "../errors";


class Password extends ValueObject<Password.Value> {
    private constructor(value: Password.Value) {
        if (!Password.isValid(value)) {
            throw new UnsafePasswordError();
        }
        super(value);
    }

    static fromString(value: string): Password {

        return new Password(value);
    }

    private static isValid(value: string): boolean {
        const validationSchema = z.string().min(8).refine(v => /[A-Z]/.test(v)).refine(v => /[a-z]/.test(v)).refine(v => /\d/.test(v)).refine(v => /[^A-Za-z0-9]/.test(v));
        return validationSchema.safeParse(value).success;
    }

    toJSON(): string {
        return this.value;
    }
}

namespace Password {
    export const ValueSchema = z.string();
    export type Value = z.infer<typeof ValueSchema>;

    export const JsonSchema = ValueSchema;
    export type Json = z.infer<typeof JsonSchema>;
}

export { Password };
