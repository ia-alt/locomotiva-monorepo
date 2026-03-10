import { z } from "zod";
import { ValueObject } from "../base-classes";
import { InvalidTimeError } from "../error";
import { set } from "date-fns";

class OnlyTime extends ValueObject<OnlyTime.Value> {
  constructor(hour: number, minute: number, second: number);
  constructor(value: OnlyTime.Value);
  constructor();
  constructor(
    hourOrValue?: number | OnlyTime.Value,
    minute?: number,
    second?: number,
  ) {
    if (typeof hourOrValue === "object") {
      const { hour, minute, second } = hourOrValue;
      if (!OnlyTime.isValidTime(hour, minute, second)) {
        throw new InvalidTimeError();
      }
      super({ hour, minute, second });
      return;
    }

    if (
      hourOrValue === undefined ||
      minute === undefined ||
      second === undefined
    ) {
      const currentDate = new Date();
      hourOrValue = currentDate.getHours();
      minute = currentDate.getMinutes();
      second = currentDate.getSeconds();
    }

    if (!OnlyTime.isValidTime(hourOrValue as number, minute, second)) {
      throw new InvalidTimeError();
    }

    super({ hour: hourOrValue as number, minute: minute, second: second });
  }

  public static fromDate(date: Date): OnlyTime {
    return new OnlyTime(date.getHours(), date.getMinutes(), date.getSeconds());
  }

  public static isValidTime(
    hour: number,
    minute: number,
    second: number,
  ): boolean {
    if (
      hour < 0 ||
      hour > 23 ||
      !Number.isInteger(hour) ||
      minute < 0 ||
      minute > 59 ||
      !Number.isInteger(minute) ||
      second < 0 ||
      second > 59 ||
      !Number.isInteger(second)
    ) {
      return false;
    }
    return true;
  }

  public getHour(): number {
    return this.value.hour;
  }

  public getMinute(): number {
    return this.value.minute;
  }

  public getSecond(): number {
    return this.value.second;
  }

  public toString(): string {
    return `${this.value.hour.toString().padStart(2, "0")}:${String(
      this.value.minute,
    ).padStart(2, "0")}-${String(this.value.second).padStart(2, "0")}`;
  }

  public toDate(): Date {
    return this.aplayInDate(new Date());
  }

  public aplayInDate(date: Date): Date {
    return set(date, {
      hours: this.value.hour,
      minutes: this.value.minute,
      seconds: this.value.second,
      milliseconds: 0,
    });
  }

  toJSON(): z.infer<typeof OnlyTime.JsonSchema> {
    return {
      hour: this.value.hour,
      minute: this.value.minute,
      second: this.value.second,
    };
  }

  valueOf() {
    return (
      this.value.second + this.value.minute * 60 + this.value.hour * 60 * 60
    );
  }

  equals(other: OnlyTime): boolean {
    return this.valueOf() === other.valueOf();
  }

  static fromJSON(json: OnlyTime.Json): OnlyTime {
    return new OnlyTime(json.hour, json.minute, json.second);
  }
}

namespace OnlyTime {
  export const ValueSchema = z.object({
    hour: z.number(),
    minute: z.number(),
    second: z.number(),
  });

  export const JsonSchema = ValueSchema;

  export type Value = z.infer<typeof ValueSchema>;
  export type Json = z.infer<typeof JsonSchema>;
}

export { OnlyTime };
