import { InvalidPageSizeError } from "../../error";
import { ValueObject } from "../../base-classes";

export class PageSize extends ValueObject<number> {
  constructor(value: number) {

    if (value <= 0) {
      throw new InvalidPageSizeError(value);
    }

    super(value);
  }

  toJSON() {
    return this.value;
  }

  toString(): string {
    return this.value.toString();
  }

  equals(other: PageSize): boolean {
    return this.value === other.value;
  }
}
