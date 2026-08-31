import { Entity, UniqueId } from "@core/base-classes";
import z from "zod";
import { InvalidRoomDescriptionError } from "../errors";

const DESCRIPTION_MAX_LENGTH = 500;

class Room extends Entity {
    constructor(
        id: UniqueId,
        private _name: string,
        private capacity: number,
        private enabled: boolean,
        private photoUrl: string | null = null,
        private description: string | null = null,
    ) {
        super(id);
    }

    get name(): string {
        return this._name;
    }

    static create(input: Room.CreateParams): Room {
        return new Room(
            UniqueId.create(),
            input.name,
            input.capacity,
            input.enabled,
            input.photoUrl ?? null,
            Room.normalizeDescription(input.description),
        );
    }

    update(input: Room.UpdateParams): void {
        this._name = input.name;
        this.capacity = input.capacity;
        this.photoUrl = input.photoUrl ?? null;
        this.description = Room.normalizeDescription(input.description);
    }

    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    private static normalizeDescription(description?: string | null): string | null {
        const trimmed = description?.trim();
        if (!trimmed) return null;
        if (trimmed.length > DESCRIPTION_MAX_LENGTH) {
            throw new InvalidRoomDescriptionError(DESCRIPTION_MAX_LENGTH);
        }
        return trimmed;
    }

    toJSON(): Room.JsonSchema {
        return {
            id: this.id.value,
            name: this._name,
            capacity: this.capacity,
            enabled: this.enabled,
            photoUrl: this.photoUrl,
            description: this.description,
        };
    }
}

namespace Room {
    export const CreateSchema = z.object({
        name: z.string(),
        capacity: z.number(),
        enabled: z.boolean(),
        photoUrl: z.string().nullable().optional(),
        description: z.string().nullable().optional(),
    });

    export const UpdateSchema = z.object({
        name: z.string(),
        capacity: z.number(),
        photoUrl: z.string().nullable().optional(),
        description: z.string().nullable().optional(),
    });

    export const JsonSchema = z.object({
        id: z.string(),
        name: z.string(),
        capacity: z.number(),
        enabled: z.boolean(),
        photoUrl: z.string().nullable(),
        description: z.string().nullable(),
    });

    export type CreateParams = z.infer<typeof CreateSchema>;
    export type UpdateParams = z.infer<typeof UpdateSchema>;
    export type JsonSchema = z.infer<typeof JsonSchema>;
}

export { Room };
