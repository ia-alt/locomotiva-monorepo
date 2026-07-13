import { Entity, UniqueId } from "@core/base-classes";
import z from "zod";

class Printer extends Entity {
    constructor(
        id: UniqueId,
        private _name: string,
        private _model: string,
        private _enabled: boolean,
        private _notes: string | null = null,
    ) {
        super(id);
    }

    get name(): string {
        return this._name;
    }

    get enabled(): boolean {
        return this._enabled;
    }

    static create(input: Printer.CreateParams): Printer {
        return new Printer(
            UniqueId.create(),
            input.name,
            input.model,
            input.enabled,
            input.notes ?? null,
        );
    }

    update(input: Printer.UpdateParams): void {
        this._name = input.name;
        this._model = input.model;
        this._notes = input.notes ?? null;
    }

    setEnabled(enabled: boolean): void {
        this._enabled = enabled;
    }

    toJSON(): Printer.JsonSchema {
        return {
            id: this.id.value,
            name: this._name,
            model: this._model,
            enabled: this._enabled,
            notes: this._notes,
        };
    }
}

namespace Printer {
    export const CreateSchema = z.object({
        name: z.string(),
        model: z.string(),
        enabled: z.boolean(),
        notes: z.string().nullable().optional(),
    });

    export const UpdateSchema = z.object({
        name: z.string(),
        model: z.string(),
        notes: z.string().nullable().optional(),
    });

    export const JsonSchema = z.object({
        id: z.string(),
        name: z.string(),
        model: z.string(),
        enabled: z.boolean(),
        notes: z.string().nullable(),
    });

    export type CreateParams = z.infer<typeof CreateSchema>;
    export type UpdateParams = z.infer<typeof UpdateSchema>;
    export type JsonSchema = z.infer<typeof JsonSchema>;
}

export { Printer };
