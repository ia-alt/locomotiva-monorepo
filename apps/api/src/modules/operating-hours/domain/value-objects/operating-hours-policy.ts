import { ValueObject } from "@core/base-classes";
import z from "zod";
import { WeeklySchedule } from "./weekly-schedule";
import { OnlyDate } from "@core/value-objects";
import { DayOfWeek } from "@core/schemas";
import { DailyAvailability } from "./daily-availability";

class OperatingHoursPolicy extends ValueObject<OperatingHoursPolicy.Value> {
    constructor(value: OperatingHoursPolicy.Value) {
        super(value);
    }

    toJSON(): OperatingHoursPolicy.Json {
        return {
            weeklySchedule: this.value.weeklySchedule.toJSON(),
            effectiveFrom: this.value.effectiveFrom.toJSON(),
        };
    }

    getDay(day: DayOfWeek): DailyAvailability | null {
        return this.value.weeklySchedule.getDay(day);
    }

    static fromJSON(json: OperatingHoursPolicy.Json): OperatingHoursPolicy {
        return new OperatingHoursPolicy({
            weeklySchedule: WeeklySchedule.fromJSON(json.weeklySchedule),
            effectiveFrom: OnlyDate.fromJSON(json.effectiveFrom),
        });
    }
}

namespace OperatingHoursPolicy {
    export const ValueSchema = z.object({
        weeklySchedule: z.instanceof(WeeklySchedule),
        effectiveFrom: z.instanceof(OnlyDate),
    });

    export const JsonSchema = z.object({
        weeklySchedule: WeeklySchedule.JsonSchema,
        effectiveFrom: OnlyDate.JsonSchema,
    });

    export type Value = z.infer<typeof ValueSchema>;
    export type Json = z.infer<typeof JsonSchema>;
}

export { OperatingHoursPolicy };