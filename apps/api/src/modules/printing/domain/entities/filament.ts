import { Entity, UniqueId } from "@core/base-classes";
import z from "zod";
import { InvalidFilamentNameError } from "../errors";

/**
 * Tipo de filamento disponível para impressão (ex.: PETG, ABS, PLA).
 * Catálogo gerido pelo admin; o cliente escolhe um deles ao pedir.
 * O pedido referencia o filamento por id — um filamento já usado em
 * pedidos não pode ser excluído do catálogo.
 */
class Filament extends Entity {
    private readonly _name: string;

    constructor(
        id: UniqueId,
        name: string,
    ) {
        super(id);
        // validação de domínio (o schema não valida tamanho/formato)
        const trimmed = name.trim();
        if (trimmed.length < 2 || trimmed.length > 40) {
            throw new InvalidFilamentNameError();
        }
        this._name = trimmed;
    }

    get name(): string {
        return this._name;
    }

    static create(input: Filament.CreateParams): Filament {
        return new Filament(UniqueId.create(), input.name);
    }

    toJSON(): Filament.JsonSchema {
        return {
            id: this.id.value,
            name: this._name,
        };
    }
}

namespace Filament {
    export const CreateSchema = z.object({
        name: z.string(),
    });

    export const JsonSchema = z.object({
        id: z.string(),
        name: z.string(),
    });

    export type CreateParams = z.infer<typeof CreateSchema>;
    export type JsonSchema = z.infer<typeof JsonSchema>;
}

export { Filament };
