import { OnlyDate } from "@core/value-objects";
import { InvalidBirthDateError } from "../errors";

class BirthDate extends OnlyDate {
    constructor(value: string) {
        super(value);
        const age = this.getDiffInYears();
        if (age < 16) {
            // Erro de domínio, não `Error` genérico: este caminho é alcançável
            // pelo formulário de cadastro, e um Error solto vira 500 sem
            // mensagem útil em vez de um 400 explicando o motivo.
            throw new InvalidBirthDateError();
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
