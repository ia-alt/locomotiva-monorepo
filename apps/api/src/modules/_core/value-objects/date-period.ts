import { z } from "zod";
import { InvalidDatePeriodError } from "../error";
import { ValueObject } from "../base-classes";
import { OnlyDate } from "./only-date";
import { endOfDay, startOfDay } from "date-fns";
import { TimeInterval } from "src/modules/operating-hours/domain/value-objects";

class DatePeriod extends ValueObject<DatePeriod.Value> {
  constructor(value: DatePeriod.Value) {
    if (value.from >= value.to) {
      throw new InvalidDatePeriodError();
    }

    super(value);
  }

  public static fromPrimitive(
    primitive: z.infer<typeof DatePeriod.ValueSchema>
  ) {
    const from = new Date(primitive.from);
    const to = new Date(primitive.to);

    return new DatePeriod({
      from,
      to,
    });
  }

  static fromBeginToEndOfTheDay(date: OnlyDate | Date): DatePeriod {
    if (date instanceof OnlyDate) {
      date = date.toDate();
    }

    const from = startOfDay(date);
    const to = endOfDay(date);
    return new DatePeriod({
      from,
      to,
    });
  }

  subtract(other: DatePeriod): DatePeriod[] {
    if (other.value.to < this.value.from || other.value.from > this.value.to) {
      return [this];
    }

    if (other.value.from < this.value.from && other.value.to > this.value.to) {
      return [];
    }

    const periods: DatePeriod[] = [];

    if (other.value.from > this.value.from) {
      periods.push(new DatePeriod({
        from: this.value.from,
        to: other.value.from,
      }));
    }

    if (other.value.to < this.value.to) {
      periods.push(new DatePeriod({
        from: other.value.to,
        to: this.value.to,
      }));
    }

    return periods;
  }

  overlaps(other: DatePeriod): boolean {
    if (this.value.to === other.value.from || this.value.from === other.value.to) {
      return false;
    }
    if (this.value.from === other.value.from || this.value.to === other.value.to) {
      return true;
    }
    return this.value.from < other.value.to && this.value.to > other.value.from;
  }

  contains(other: DatePeriod): boolean {
    return this.value.from <= other.value.from && this.value.to >= other.value.to;
  }

  subtractAll(others: DatePeriod[]): DatePeriod[] {
    let periods: DatePeriod[] = [this];

    for (const other of others) {
      const newPeriods: DatePeriod[] = [];
      for (const period of periods) {
        newPeriods.push(...period.subtract(other));
      }
      periods = newPeriods;
    }

    return periods;
  }

  toJSON() {
    return {
      from: this.value.from.toJSON(),
      to: this.value.to.toJSON(),
    };
  }

  valueOf() {
    const from = this.value.from.toISOString();
    const to = this.value.to.toISOString();
    const from_to = `${from}_${to}`;
    return from_to;
  }

  equals(other: DatePeriod): boolean {
    if (this.valueOf() !== other.valueOf()) {
      return false;
    }

    return true;
  }

  toString() {
    return `from ${this.value.from.toISOString()} to ${this.value.to.toISOString()}`;
  }
}

namespace DatePeriod {
  export const ValueSchema = z.object({
    from: z.iso.datetime(),
    to: z.iso.datetime(),
  });

  export type Value = {
    from: Date;
    to: Date;
  };
}

export { DatePeriod };
