import { ValueObject } from "@core/base-classes";
import { DomainError, ErrorType } from "@core/error";
import { DatePeriod, OnlyTime } from "@core/value-objects";
import z from "zod";

class TimeInterval extends ValueObject<TimeInterval.Value> {
  constructor(value: TimeInterval.Value) {
    super(value);
    if (value.start >= value.end) {
      throw new DomainError("INVALID_INTERVAL", "Intervalo de tempo inválido", ErrorType.BAD_REQUEST);
    }
  }

  contains(other: TimeInterval) {
    /*
    const s1 = this.value.start.toString();
    const e1 = this.value.end.toString();
    const s2 = other.value.start.toString();
    const e2 = other.value.end.toString();

    console.log('\n[TimeInterval.contains DEBUG]');

    const ts = this.value.start.valueOf();
    const te = this.value.end.valueOf();
    const os = other.value.start.valueOf();
    const oe = other.value.end.valueOf();

    const points = Array.from(new Set([ts, te, os, oe])).sort((a, b) => a - b);
    const getPos = (val: number) => points.indexOf(val) * 22;

    const drawLine = (sVal: number, eVal: number, sStr: string, eStr: string) => {
      const startPos = getPos(sVal);
      const endPos = getPos(eVal);
      const prefix = " ".repeat(startPos);
      const content = `[${sStr}`.padEnd(endPos - startPos, "=") + ` ${eStr}]`;
      return prefix + content;
    };

    console.log(`THIS  INTERVAL: ${drawLine(ts, te, s1, e1)}`);
    console.log(`OTHER INTERVAL: ${drawLine(os, oe, s2, e2)}`);
    */
    const containsStart = this.value.start <= other.value.start;
    const containsEnd = this.value.end >= other.value.end;

    /*
    console.log(`- Start is within bounds (this.start <= other.start): ${containsStart}`);
    console.log(`- End is within bounds (this.end >= other.end): ${containsEnd}`);
    */
    return containsStart && containsEnd;
  }

  toDatePeriod(date: Date): DatePeriod {
    const from = this.value.start.aplayInDate(date);
    const to = this.value.end.aplayInDate(date);
    return new DatePeriod({ from, to });
  }

  overlaps(other: TimeInterval): boolean {
    if (this.value.end === other.value.start || this.value.start === other.value.end) {
      return false;
    }
    if (this.value.start === other.value.start || this.value.end === other.value.end) {
      return true;
    }
    return this.value.start < other.value.end && this.value.end > other.value.start;
  }

  subtract(other: TimeInterval): TimeInterval[] {
    if (other.value.end < this.value.start || other.value.start > this.value.end) {
      return [this];
    }

    if (other.value.start < this.value.start && other.value.end > this.value.end) {
      return [];
    }

    const intervals: TimeInterval[] = [];

    if (other.value.start > this.value.start) {
      intervals.push(new TimeInterval({
        start: this.value.start,
        end: other.value.start,
      }));
    }

    if (other.value.end < this.value.end) {
      intervals.push(new TimeInterval({
        start: other.value.end,
        end: this.value.end,
      }));
    }

    return intervals;
  }

  subtractAll(others: TimeInterval[]): TimeInterval[] {
    let intervals: TimeInterval[] = [this];

    for (const other of others) {
      const newPeriods: TimeInterval[] = [];
      for (const interval of intervals) {
        newPeriods.push(...interval.subtract(other));
      }
      intervals = newPeriods;
    }

    return intervals;
  }

  toJSON(): TimeInterval.Json {
    return {
      start: this.value.start.toJSON(),
      end: this.value.end.toJSON(),
    };
  }

  static fromJSON(json: TimeInterval.Json): TimeInterval {
    return new TimeInterval({
      start: OnlyTime.fromJSON(json.start),
      end: OnlyTime.fromJSON(json.end),
    });
  }

  toString(): string {
    return `${this.value.start} -> ${this.value.end}`;
  }
}

namespace TimeInterval {
  export const ValueSchema = z.object({
    start: z.instanceof(OnlyTime),
    end: z.instanceof(OnlyTime),
  });

  export const JsonSchema = z.object({
    start: OnlyTime.JsonSchema,
    end: OnlyTime.JsonSchema,
  });

  export type Value = z.infer<typeof ValueSchema>;
  export type Json = z.infer<typeof JsonSchema>;
}

export { TimeInterval };
