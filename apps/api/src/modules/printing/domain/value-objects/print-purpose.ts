import { z } from "zod";
import { ValueObject } from "@core/base-classes";
import { InvalidPrintPurposeError } from "../errors/invalid-print-purpose-error";

class PrintPurpose extends ValueObject<string> {
  constructor(value: string) {
    if (value.length < 5 || value.length > 500) {
      throw new InvalidPrintPurposeError();
    }
    super(value);
  }

  toJSON() {
    return this.value;
  }
}

namespace PrintPurpose {
  export const ValueSchema = z.string();
}

export { PrintPurpose };
