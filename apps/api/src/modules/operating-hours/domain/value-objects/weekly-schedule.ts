import { ValueObject } from "@core/base-classes";
import z from "zod";
import { DailyAvailability } from "./daily-availability";
import { DayOfWeek, DayOfWeekSchema } from "@core/schemas";

class WeeklySchedule extends ValueObject<WeeklySchedule.Value> {
  constructor(value: WeeklySchedule.Value) {
    super(value);
  }

  toJSON(): WeeklySchedule.Json {
    return {
      Monday: this.value.Monday?.toJSON() ?? null,
      Tuesday: this.value.Tuesday?.toJSON() ?? null,
      Wednesday: this.value.Wednesday?.toJSON() ?? null,
      Thursday: this.value.Thursday?.toJSON() ?? null,
      Friday: this.value.Friday?.toJSON() ?? null,
      Saturday: this.value.Saturday?.toJSON() ?? null,
      Sunday: this.value.Sunday?.toJSON() ?? null,
    };
  }

  getDay(day: DayOfWeek): DailyAvailability | null {
    return this.value[day] ?? null;
  }

  static fromJSON(json: WeeklySchedule.Json): WeeklySchedule {
    return new WeeklySchedule({
      Monday: json.Monday ? DailyAvailability.fromJSON(json.Monday) : null,
      Tuesday: json.Tuesday ? DailyAvailability.fromJSON(json.Tuesday) : null,
      Wednesday: json.Wednesday ? DailyAvailability.fromJSON(json.Wednesday) : null,
      Thursday: json.Thursday ? DailyAvailability.fromJSON(json.Thursday) : null,
      Friday: json.Friday ? DailyAvailability.fromJSON(json.Friday) : null,
      Saturday: json.Saturday ? DailyAvailability.fromJSON(json.Saturday) : null,
      Sunday: json.Sunday ? DailyAvailability.fromJSON(json.Sunday) : null,
    });
  }
}

namespace WeeklySchedule {


  export const ValueSchema = z.record(
    DayOfWeekSchema,
    z.instanceof(DailyAvailability).nullable(),
  );

  export const JsonSchema = z.record(
    DayOfWeekSchema,
    DailyAvailability.JsonSchema.nullable()
  )


  export type Value = z.infer<typeof ValueSchema>;
  export type Json = z.infer<typeof JsonSchema>;
}


export { WeeklySchedule };
