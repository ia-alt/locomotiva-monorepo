import { z } from "zod";
import { ValueObject } from "@core/base-classes";
import { InvalidBookingNumberOfPeopleError } from "../../booking/domain/errors";

class BookingNumberOfPeople extends ValueObject<number> {
  constructor(value: number) {
    if (!Number.isInteger(value) || value < 1) {
      throw new InvalidBookingNumberOfPeopleError();
    }
    super(value);
  }

  toJSON() {
    return this.value;
  }
}

namespace BookingNumberOfPeople {
  export const ValueSchema = z.number();
}

export { BookingNumberOfPeople };
