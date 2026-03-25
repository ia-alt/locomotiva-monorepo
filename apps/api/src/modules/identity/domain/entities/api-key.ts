import { AggregateRoot, UniqueId } from "@core/base-classes";
import z from "zod";

class ApiKey extends AggregateRoot {
    constructor(
        id: UniqueId,
        public name: string,
        private _keyHash: string,
        public readonly createdAt: Date,
    ) {
        super(id);
    }

    static create(props: ApiKey.CreateParams): ApiKey {
        return new ApiKey(
            UniqueId.create(),
            props.name,
            props.keyHash,
            new Date(),
        );
    }

    getKeyHash(): string {
        return this._keyHash;
    }

    toJSON(): ApiKey.JsonSchema {
        return {
            id: this.id.value,
            name: this.name,
            createdAt: this.createdAt,
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
    });
    export type JsonSchema = z.infer<typeof JsonSchema>;
}

export { ApiKey };
