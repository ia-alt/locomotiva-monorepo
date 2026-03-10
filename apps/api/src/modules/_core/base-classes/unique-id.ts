import z from "zod";
import { ValueObject } from "./value-object";
import { DomainError } from "@core/error";

export class UniqueId extends ValueObject<UniqueId.Value> {
    private constructor(value: UniqueId.Value) {
        if (!UniqueId.ValueSchema.safeParse(value).success) {
            throw new DomainError("INVALID_UNIQUE_ID", "Id inválido");
        }
        super(value);
    }

    static create(): UniqueId {
        return new UniqueId(crypto.randomUUID());
    }

    static fromString(value: string): UniqueId {
        return new UniqueId(value);
    }

    toString(): string {
        return this.value;
    }

    toJSON(): string {
        return this.value;
    }
}

export namespace UniqueId {
    export const JsonSchema = z.string();

    export const ValueSchema = z.uuid();

    export type Json = z.infer<typeof JsonSchema>;
    export type Value = z.infer<typeof ValueSchema>;
}
