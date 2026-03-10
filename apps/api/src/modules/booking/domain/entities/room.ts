import { Entity, UniqueId } from "@core/base-classes";
import z from "zod";

class Room extends Entity {
    constructor(
        id: UniqueId,
        private _name: string,
        private capacity: number,
        private enabled: boolean,
    ) {
        super(id);
    }

    get name(): string {
        return this._name;
    }

    static create(input: Room.CreateParams): Room {
        return new Room(UniqueId.create(), input.name, input.capacity, input.enabled);
    }

    update(input: Room.UpdateParams): void {
        this._name = input.name;
        this.capacity = input.capacity;
    }

    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    toJSON(): Room.JsonSchema {
        return {
            id: this.id.value,
            name: this._name,
            capacity: this.capacity,
            enabled: this.enabled,
        };
    }
}

namespace Room {
    export const CreateSchema = z.object({
        name: z.string(),
        capacity: z.number(),
        enabled: z.boolean(),
    });

    export const UpdateSchema = z.object({
        name: z.string(),
        capacity: z.number(),
    });

    export const JsonSchema = z.object({
        id: z.string(),
        name: z.string(),
        capacity: z.number(),
        enabled: z.boolean(),
    });

    export type CreateParams = z.infer<typeof CreateSchema>;
    export type UpdateParams = z.infer<typeof UpdateSchema>;
    export type JsonSchema = z.infer<typeof JsonSchema>;
}

export { Room };