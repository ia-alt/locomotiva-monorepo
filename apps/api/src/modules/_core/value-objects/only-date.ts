import { z } from "zod";
import { ValueObject } from "../base-classes";
import { InvalidDateError } from "../error";
import { DayOfWeekSchema } from "@core/schemas";

class OnlyDate extends ValueObject<OnlyDate.Value> {
  private year: number;
  private month: number;
  private day: number;

  constructor(value?: OnlyDate.Value) {
    if (value) {
      if (!OnlyDate.isValidDate(value)) {
        throw new InvalidDateError();
      }
    } else {
      value = new Date().toISOString().split("T")[0];
    }

    super(value);

    const [year, month, day] = value.split("-").map(Number);

    this.year = year;
    this.month = month;
    this.day = day;
  }

  public static fromDate(date: Date): OnlyDate {
    return new OnlyDate(date.toISOString().split("T")[0]);
  }

  public static isValidDate(date: string): boolean {
    const validationSchema = z.iso.date();
    return validationSchema.safeParse(date).success;
  }

  public getYear(): number {
    return this.year;
  }

  public getMonth(): number {
    return this.month;
  }

  public getDay(): number {
    return this.day;
  }

  public getDiffInYears(reference?: OnlyDate): number {
    const today = reference ?? OnlyDate.fromDate(new Date());
    let age = today.getYear() - this.getYear();
    if (today.getMonth() < this.getMonth() || (today.getMonth() === this.getMonth() && today.getDay() < this.getDay())) {
      age -= 1;
    }
    return age;
  }

  public getDayOfWeekName(): z.infer<typeof DayOfWeekSchema> {
    return this.toDate().toLocaleDateString("en-US", { weekday: "long" }) as z.infer<typeof DayOfWeekSchema>;
  }

  public toString(): string {
    return this.value;
  }

  public toDate(): Date {
    return new Date(
      this.year,
      this.month - 1,
      this.day,
      12,
      0,
      0
    );
  }

  toJSON(): OnlyDate.Json {
    return this.value
  }

  valueOf() {
    return this.toDate().getTime();
  }

  equals(other: OnlyDate): boolean {
    return this.valueOf() === other.valueOf();
  }

  static fromJSON(json: OnlyDate.Json): OnlyDate {
    return new OnlyDate(json);
  }
}

namespace OnlyDate {
  export const ValueSchema = z.string();

  export const JsonSchema = ValueSchema;

  export type Value = z.infer<typeof ValueSchema>;
  export type Json = z.infer<typeof JsonSchema>;
}

export { OnlyDate };
