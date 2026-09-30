import { ValueObject } from "@core/base-classes";
import z from "zod";
import { User } from "src/modules/identity/domain/entities";
import { PrintRequest } from "../entities/print-request";
import { Filament } from "../entities/filament";
import { Printer } from "../entities/printer";

class PrintRequestWithDetails extends ValueObject<PrintRequestWithDetails.Value> {
    constructor(value: PrintRequestWithDetails.Value) {
        super(value);
    }

    toJSON(): PrintRequestWithDetails.Json {
        return {
            printRequest: this.value.printRequest.toJSON(),
            user: this.value.user.toJSON(),
            filament: this.value.filament.toJSON(),
            printer: this.value.printer?.toJSON() ?? null,
        };
    }
}

namespace PrintRequestWithDetails {
    export const ValueSchema = z.object({
        printRequest: z.instanceof(PrintRequest),
        user: z.instanceof(User),
        filament: z.instanceof(Filament),
        printer: z.instanceof(Printer).nullable(),
    });

    export type Value = z.infer<typeof ValueSchema>;

    export const JsonSchema = z.object({
        printRequest: PrintRequest.JsonSchema,
        user: User.JsonSchema,
        filament: Filament.JsonSchema,
        printer: Printer.JsonSchema.nullable(),
    });

    export type Json = z.infer<typeof JsonSchema>;
}

export { PrintRequestWithDetails };
