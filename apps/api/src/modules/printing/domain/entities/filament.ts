import { Entity, UniqueId } from "@core/base-classes";
import z from "zod";
import { InvalidFilamentNameError } from "../errors";

/**
 * Tipo de filamento disponível para impressão (ex.: PETG, ABS, PLA).
 * Catálogo gerido pelo admin; o cliente escolhe um deles ao pedir.
 * O pedido referencia o filamento por id — um filamento já usado em
 * pedidos não pode ser excluído do catálogo, apenas desativado: some
 * da lista de escolha do cliente, mas o histórico continua resolvendo.
 */
class Filament extends Entity {
    private readonly _name: string;
    private _active: boolean;

    constructor(
        id: UniqueId,
        name: string,
        active: boolean,
    ) {
        super(id);
        // validação de domínio (o schema não valida tamanho/formato)
        const trimmed = name.trim();
        if (trimmed.length < 2 || trimmed.length > 40) {
            throw new InvalidFilamentNameError();
        }
        this._name = trimmed;
        this._active = active;
    }

    get name(): string {
        return this._name;
    }

    get active(): boolean {
        return this._active;
    }

    /** Aposenta o filamento do catálogo sem apagar o histórico dos pedidos. */
    deactivate(): void {
        this._active = false;
    }

    static create(input: Filament.CreateParams): Filament {
        return new Filament(UniqueId.create(), input.name, true);
    }

    toJSON(): Filament.JsonSchema {
        return {
            id: this.id.value,
            name: this._name,
            active: this._active,
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
        active: z.boolean(),
    });

    export type CreateParams = z.infer<typeof CreateSchema>;
    export type JsonSchema = z.infer<typeof JsonSchema>;
}

export { Filament };
