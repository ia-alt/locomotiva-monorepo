import { z } from "zod";
import { ValueObject } from "@core/base-classes";
import { InvalidBookingDescriptionError } from "../../booking/domain/errors";

class BookingDescription extends ValueObject<string> {
  constructor(value: string) {
    if (value.length < 10 || value.length > 200) {
      throw new InvalidBookingDescriptionError();
    }
    super(value);
  }

  toJSON() {
    return this.value;
  }
}

namespace BookingDescription {
  export const ValueSchema = z.string().min(10).max(200);
}

export { BookingDescription };
