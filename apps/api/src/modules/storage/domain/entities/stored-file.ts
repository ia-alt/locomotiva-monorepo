import { Entity, UniqueId } from "@core/base-classes";
import z from "zod";
import { InvalidFileNameError } from "../errors";

class StoredFile extends Entity {
    private readonly _name: string;

    constructor(
        id: UniqueId,
        name: string,
        private readonly _path: string,
        private readonly _sizeBytes: number,
        private _deleted: boolean,
        private readonly _uploadedByUserId: UniqueId,
        private readonly _createdAt: Date,
        private _updatedAt: Date,
    ) {
        super(id);
        const trimmed = name.trim();
        if (!trimmed) {
            throw new InvalidFileNameError();
        }
        this._name = trimmed;
    }

    get name(): string {
        return this._name;
    }

    get path(): string {
        return this._path;
    }

    get sizeBytes(): number {
        return this._sizeBytes;
    }

    get deleted(): boolean {
        return this._deleted;
    }

    get uploadedByUserId(): UniqueId {
        return this._uploadedByUserId;
    }

    get createdAt(): Date {
        return this._createdAt;
    }

    get updatedAt(): Date {
        return this._updatedAt;
    }

    get extension(): string {
        const dotIndex = this._name.lastIndexOf(".");
        return dotIndex === -1 ? "" : this._name.slice(dotIndex).toLowerCase();
    }

    static create(input: StoredFile.CreateParams): StoredFile {
        return new StoredFile(
            UniqueId.create(),
            input.name,
            input.path,
            input.sizeBytes,
            false,
            input.uploadedByUserId,
            new Date(),
            new Date(),
        );
    }

    toJSON(): StoredFile.JsonSchema {
        return {
            id: this.id.value,
            name: this._name,
            sizeBytes: this._sizeBytes,
            deleted: this._deleted,
        };
    }
}

namespace StoredFile {
    export const JsonSchema = z.object({
        id: z.string(),
        name: z.string(),
        sizeBytes: z.number(), 
        deleted: z.boolean(),
    });

    export type CreateParams = {
        name: string;
        path: string;
        sizeBytes: number;
        uploadedByUserId: UniqueId;
    };

    export type JsonSchema = z.infer<typeof JsonSchema>;
}

export { StoredFile };
