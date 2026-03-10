import { OnlyDate } from "@core/value-objects";

class BirthDate extends OnlyDate {
    constructor(value: string) {
        super(value);
        const age = this.getDiffInYears();
        if (age < 16) {
            throw new Error("Idade inválida. A idade mínima é 16 anos!");
        }
    }

    static fromJSON(json: OnlyDate.Json): BirthDate {
        return new BirthDate(json);
    }

    static fromDate(date: Date): BirthDate {
        return new BirthDate(date.toISOString().split("T")[0]);
    }
}

namespace BirthDate {
    export const ValueSchema = OnlyDate.ValueSchema;
    export type Value = OnlyDate.Value;
    export const JsonSchema = OnlyDate.JsonSchema;
    export type JsonSchema = OnlyDate.Json;
}

export { BirthDate };
