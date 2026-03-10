import { ValueObject } from "@core/base-classes";
import z from "zod";
import { TimeInterval } from "./time-interval";
import { DatePeriod, OnlyDate } from "@core/value-objects";

class DailyAvailability extends ValueObject<DailyAvailability.Value> {
  constructor(value: DailyAvailability.Value) {
    super(value);
  }

  private static isValid(value: DailyAvailability.Value): boolean {
    const { intervals } = value;

    if (intervals.length <= 1) {
      return true;
    }

    for (let i = 0; i < intervals.length - 1; i++) {
      const current = intervals[i];
      const next = intervals[i + 1];

      if (current.value.end >= next.value.start) {
        return false;
      }
    }

    return true;
  }

  toJSON(): DailyAvailability.Json {
    return {
      intervals: this.value.intervals.map((x) => x.toJSON()),
    };
  }

  static fromJSON(json: DailyAvailability.Json): DailyAvailability {
    return new DailyAvailability({
      intervals: json.intervals.map((x) => TimeInterval.fromJSON(x)),
    });
  }

  toDatePeriod(day: OnlyDate): DatePeriod[] {
    const _day = day.toDate()
    return this.value.intervals.map(it => new DatePeriod({
      from: it.value.start.aplayInDate(_day),
      to: it.value.end.aplayInDate(_day),
    }))
  }
}

namespace DailyAvailability {
  export const ValueSchema = z.object({
    intervals: z.array(z.instanceof(TimeInterval)),
  });

  export const JsonSchema = z.object({
    intervals: z.array(TimeInterval.JsonSchema),
  });

  export type Value = z.infer<typeof ValueSchema>;
  export type Json = z.infer<typeof JsonSchema>;
}

export { DailyAvailability };
