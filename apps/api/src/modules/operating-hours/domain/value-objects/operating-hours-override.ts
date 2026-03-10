import { ValueObject } from "@core/base-classes";
import z from "zod";
import { DailyAvailability } from "./daily-availability";
import { OnlyDate } from "@core/value-objects";

class OperatingHoursOverride extends ValueObject<OperatingHoursOverride.Value> {
  constructor(value: OperatingHoursOverride.Value) {
    super(value);
  }

  toJSON(): OperatingHoursOverride.Json {
    return {
      date: this.value.date.toJSON(),
      dailyAvailability: this.value.dailyAvailability?.toJSON() ?? null,
    };
  }

  static fromJSON(json: OperatingHoursOverride.Json): OperatingHoursOverride {
    return new OperatingHoursOverride({
      date: OnlyDate.fromJSON(json.date),
      dailyAvailability: json.dailyAvailability ? DailyAvailability.fromJSON(json.dailyAvailability) : null,
    });
  }
}

namespace OperatingHoursOverride {
  export const ValueSchema = z.object({
    date: z.instanceof(OnlyDate),
    dailyAvailability: z.instanceof(DailyAvailability).nullable(),
  });

  export const JsonSchema = z.object({
    date: OnlyDate.JsonSchema,
    dailyAvailability: DailyAvailability.JsonSchema.nullable(),
  });

  export type Value = z.infer<typeof ValueSchema>;
  export type Json = z.infer<typeof JsonSchema>;
}

export { OperatingHoursOverride };