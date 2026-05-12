import { ValueObject } from "@core/base-classes";
import z from "zod";
import { AccessLog } from "../entities";
import { User } from "src/modules/identity/domain/entities";


class AccessLogWithUser extends ValueObject<AccessLogWithUser.Value> {
    constructor(value: AccessLogWithUser.Value) {
        super(value);
    }

    toJSON(): AccessLogWithUser.Json {
        return {
            accessLog: this.value.accessLog.toJSON(),
            user: this.value.user.toJSON(),
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
    });

    export type Json = z.infer<typeof JsonSchema>;
}

export { AccessLogWithUser };
