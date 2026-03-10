import { Entity, UniqueId } from "@core/base-classes";
import z from "zod";

class CoworkingSettings extends Entity {
    constructor(
        id: UniqueId,
        private maxCapacity: number,
    ) {
        super(id);
    }

    static create(input: CoworkingSettings.CreateParams): CoworkingSettings {
        return new CoworkingSettings(UniqueId.create(), input.maxCapacity);
    }

    updateCapacity(maxCapacity: number): void {
        this.maxCapacity = maxCapacity;
    }

    hasSpace(currentOccupancy: number): boolean {
        return currentOccupancy < this.maxCapacity;
    }

    toJSON(): CoworkingSettings.JsonSchema {
        return {
            id: this.id.value,
            maxCapacity: this.maxCapacity,
        };
    }
}

namespace CoworkingSettings {
    export const CreateSchema = z.object({
        maxCapacity: z.number(),
    });

    export const UpdateSchema = z.object({
        maxCapacity: z.number(),
    });

    export const JsonSchema = z.object({
        id: z.string(),
        maxCapacity: z.number(),
    });

    export type CreateParams = z.infer<typeof CreateSchema>;
    export type UpdateParams = z.infer<typeof UpdateSchema>;
    export type JsonSchema = z.infer<typeof JsonSchema>;
}

class Coworking extends CoworkingSettings {}

export { CoworkingSettings, Coworking };
