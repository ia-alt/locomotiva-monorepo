import { ValueObject } from "@core/base-classes";
import z from "zod";
import { AccessLog } from "../entities";
import { User } from "src/modules/identity/domain/entities";


class AccessLogWithUser extends ValueObject<AccessLogWithUser.Value> {
    constructor(value: AccessLogWithUser.Value) {
        super(value);
    }

    get durationMinutes(): number | null {
        const { entryTime, exitTime } = this.value.accessLog.toJSON();
        if (!exitTime) return null;
        return Math.round((new Date(exitTime).getTime() - new Date(entryTime).getTime()) / 60000);
    }

    toJSON(): AccessLogWithUser.Json {
        return {
            accessLog: this.value.accessLog.toJSON(),
            user: this.value.user.toJSON(),
            durationMinutes: this.durationMinutes,
        };
    }
}

namespace AccessLogWithUser {
    export const ValueSchema = z.object({
        accessLog: z.instanceof(AccessLog),
        user: z.instanceof(User)
    });

    export type Value = z.infer<typeof ValueSchema>;

    export const JsonSchema = z.object({
        accessLog: AccessLog.JsonSchema,
        user: User.JsonSchema,
        durationMinutes: z.number().nullable(),
    });

    export type Json = z.infer<typeof JsonSchema>;
}

export { AccessLogWithUser };
