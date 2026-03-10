import { ValueObject } from "@core/base-classes";
import { DomainError, ErrorType } from "@core/error";
import { OnlyTime } from "@core/value-objects";
import z from "zod";

class TimeInterval extends ValueObject<TimeInterval.Value> {
  constructor(value: TimeInterval.Value) {
    super(value);
    if (value.start >= value.end) {
      throw new DomainError("INVALID_INTERVAL", "Intervalo de tempo inválido", ErrorType.BAD_REQUEST);
    }
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
