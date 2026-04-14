import { AggregateRoot, UniqueId } from "@core/base-classes";
import z from "zod";
import { AccessLogAlreadyCheckedOutError } from "../errors";
import { CheckinDoneEvent } from "../events/checkin-done";

class AccessLog extends AggregateRoot {
    constructor(
        id: UniqueId,
        public readonly userId: UniqueId,
        public readonly entryTime: Date,
        private exitTime: Date | null,
        public readonly checkinTotemId: UniqueId | null
    ) {
        super(id);
    }

    static create(input: AccessLog.CreateParams): AccessLog {
        const accessLog = new AccessLog(
            UniqueId.create(),
            input.userId,
            new Date(),
            null,
            input.checkinTotemId ?? null
        );
        accessLog.addDomainEvent(new CheckinDoneEvent(accessLog));
        return accessLog;
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
            exitTime: this.exitTime?.toISOString() ?? null,
            checkinTotemId: this.checkinTotemId?.value ?? null,
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
        checkinTotemId: z.string().nullable(),
    });

    export type CreateParams = {
        userId: UniqueId;
        checkinTotemId?: UniqueId | null;
    };
    export type JsonSchema = z.infer<typeof JsonSchema>;
}

export { AccessLog };
