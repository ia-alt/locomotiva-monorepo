import { z } from "zod";
import { ValueObject } from "@core/base-classes";
import { InvalidBookingTitleError } from "../../booking/domain/errors";

class BookingTitle extends ValueObject<string> {
  constructor(value: string) {
    if (value.length < 3 || value.length > 50) {
      throw new InvalidBookingTitleError();
    }
    super(value);
  }

  toJSON() {
    return this.value;
  }
}

namespace BookingTitle {
  export const ValueSchema = z.string().min(3).max(50);
}

export { BookingTitle };
