import { AggregateRoot, UniqueId } from "@core/base-classes";
import z from "zod";

class ApiKey extends AggregateRoot {
    constructor(
        id: UniqueId,
        public name: string,
        private _keyHash: string,
        public readonly createdAt: Date,
        public active: boolean = true,
    ) {
        super(id);
    }

    static create(props: ApiKey.CreateParams): ApiKey {
        return new ApiKey(
            UniqueId.create(),
            props.name,
            props.keyHash,
            new Date(),
            true,
        );
    }

    getKeyHash(): string {
        return this._keyHash;
    }

    deactivate(): void {
        this.active = false;
    }

    toJSON(): ApiKey.JsonSchema {
        return {
            id: this.id.value,
            name: this.name,
            createdAt: this.createdAt,
            active: this.active,
        };
    }
}

namespace ApiKey {
    export type CreateParams = {
        name: string;
        keyHash: string;
    };

    export const JsonSchema = z.object({
        id: z.string(),
        name: z.string(),
        createdAt: z.date(),
        active: z.boolean(),
    });
    export type JsonSchema = z.infer<typeof JsonSchema>;
}

export { ApiKey };
