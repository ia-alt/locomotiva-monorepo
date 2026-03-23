import { ValueObject } from "@core/base-classes";
import z from "zod";
import { InvalidCpfError } from "../errors";


class Cpf extends ValueObject<Cpf.Value> {
    private constructor(value: Cpf.Value) {
        if (!Cpf.isValid(value)) {
            throw new InvalidCpfError();
        }
        super(value);
    }

    static fromString(raw: string | null): Cpf | null{
        if ( raw === null){
            return null
        }
        const numeric = raw.replace(/\D/g, "");
        return new Cpf(numeric);
    }

    private static isValid(value: Cpf.Value): boolean {
        const validationSchema = z.string().regex(/^\d{11}$/).refine(v => {
            const d = v.split("").map(n => parseInt(n));
            if (new Set(d).size === 1) return false;
            const calc = (base: number) => {
                let sum = 0;
                for (let i = 0; i < base; i++) sum += d[i] * (base + 1 - i);
                const r = (sum * 10) % 11;
                return r === 10 ? 0 : r;
            };
            return calc(9) === d[9] && calc(10) === d[10];
        });
        return validationSchema.safeParse(value).success;
    }


    toString(): string {
        return this.value;
    }

    toJSON(): string {
        return this.value;
    }

}

namespace Cpf {
    export const ValueSchema = z.string();
    export const JsonSchema = ValueSchema;
    export type Value = z.infer<typeof ValueSchema>;
    export type JsonSchema = z.infer<typeof JsonSchema>;
}

export { Cpf };
