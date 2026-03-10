import { z } from "zod";
import { OnlyDate } from "./only-date";
import { InvalidDatePeriodError } from "../error";
import { ValueObject } from "../base-classes";
import { set } from "date-fns";

class OnlyDatePeriod extends ValueObject<OnlyDatePeriod.Value> {
  constructor(value: OnlyDatePeriod.Value) {
    if (value.from >= value.to) {
      throw new InvalidDatePeriodError();
    }

    super(value);
  }

  public static fromPrimitive(
    primitive: z.infer<typeof OnlyDatePeriod.ValueSchema>
  ) {
    const from = new OnlyDate(primitive.from);
    const to = new OnlyDate(primitive.to);

    return new OnlyDatePeriod({
      from,
      to,
    });
  }

  public get asDateInterval() {
    const from = set(this.value.from.toDate(), {
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });

    const to = set(this.value.to.toDate(), {
      hours: 23,
      minutes: 59,
      seconds: 59,
      milliseconds: 999,
    });

    return { from, to };
  }

  toJSON() {
    return {
      from: this.value.from.toJSON(),
      to: this.value.to.toJSON(),
    };
  }

  valueOf() {
    const from = this.value.from.valueOf().toString();
    const to = this.value.to.valueOf().toString();
    const from_to = `${from}_${to}`;
    return from_to;
  }

  equals(other: OnlyDatePeriod): boolean {


    if (this.valueOf() !== other.valueOf()) {
      return false;
    }

    return true;
  }

  toString() {
    return `from ${this.value.from} to ${this.value.to}`;
  }
}

namespace OnlyDatePeriod {
  export const ValueSchema = z.object({
    from: OnlyDate.ValueSchema,
    to: OnlyDate.ValueSchema,
  });

  export type Value = {
    from: OnlyDate;
    to: OnlyDate;
  };
}

export { OnlyDatePeriod };
