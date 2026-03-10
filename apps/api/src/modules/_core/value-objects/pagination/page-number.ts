import { ValueObject } from "../../base-classes";
import { InvalidPageNumberError } from "../../error";

export class PageNumber extends ValueObject<number> {
  constructor(value: number) {
    if (value < 1) {
      throw new InvalidPageNumberError();
    }

    super(value);
  }

  toJSON() {
    return this.value;
  } 

  toString(): string {
    return this.value.toString();
  }

  equals(other: PageNumber): boolean {
    return this.value === other.value;
  }
}
