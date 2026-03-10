import { z } from "zod";
import { ValueObject } from "../base-classes";
import { InvalidEmailError } from "../error";

const emailSchema = z.email();

class EmailAddress extends ValueObject<string> {
  constructor(email: string) {
    const { error } = emailSchema.safeParse(email);

    if (error) {
      throw new InvalidEmailError(email);
    }

    super(email);
  }

  static fromString(email: string): EmailAddress {
    return new EmailAddress(email)
  }

  toJSON() {
    return this.value;
  }

  toString(): string {
    return this.value;
  }
}

namespace EmailAddress {
  export const JsonSchema = emailSchema;
  export type Json = z.infer<typeof JsonSchema>;
}

export { EmailAddress };
