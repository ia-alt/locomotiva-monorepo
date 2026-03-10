import { Entity, UniqueId } from "@core/base-classes";
import z from "zod";
import { AccessLogAlreadyCheckedOutError } from "../errors";

class AccessLog extends Entity {
    constructor(
        id: UniqueId,
        public readonly userId: UniqueId,
        public readonly entryTime: Date,
        public exitTime?: Date | null
    ) {
        super(id);
    }

    static create(input: AccessLog.CreateParams): AccessLog {
        return new AccessLog(UniqueId.create(), input.userId, new Date());
    }

    doCheckout(): void {
        if (this.exitTime) {
            throw new AccessLogAlreadyCheckedOutError();
        }
        this.exitTime = new Date();
    }

    toJSON(): AccessLog.JsonSchema {
        return {
            id: this.id.value,
            userId: this.userId.value,
            entryTime: this.entryTime.toISOString(),
            exitTime: this.exitTime ? this.exitTime.toISOString() : null,
        };
    }
}

namespace AccessLog {
    export const CreateSchema = z.object({
        userId: z.string(),
    });

    export const JsonSchema = z.object({
        id: z.string(),
        userId: z.string(),
        entryTime: z.string(),
        exitTime: z.string().nullable(),
    });

    export type CreateParams = {
        userId: UniqueId;
    };
    export type JsonSchema = z.infer<typeof JsonSchema>;
}

export { AccessLog };
