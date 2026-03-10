import { ValueObject } from "../../base-classes";
import { PageNumber } from "./page-number";
import { PageSize } from "./page-size";
import { z } from "zod";

class PaginatedQuery extends ValueObject<PaginatedQuery.Value> {
  public get pageNumber() {
    return this.value.pageNumber.value;
  }

  public get pageSize() {
    return this.value.pageSize.value;
  }

  public get asTakeSkip() {
    return {
      take: this.pageSize,
      skip: (this.pageNumber - 1) * this.pageSize,
    };
  }
  toJSON() {
    return {
      pageNumber: this.value.pageNumber.toJSON(),
      pageSize: this.value.pageSize.toJSON(),
    };
  }

  toString(): string {
    return `${this.value.pageNumber.toString()}-${this.value.pageSize.toString()}`;
  }

  public static create(
    params: z.infer<typeof PaginatedQuery.Schema>
  ): PaginatedQuery {
    const pageNumber = new PageNumber(params.pageNumber);
    const pageSize = new PageSize(params.pageSize);

    return new PaginatedQuery({ pageNumber, pageSize });
  }

  equals(other: PaginatedQuery): boolean {
    return this.value.pageNumber.equals(other.value.pageNumber) && this.value.pageSize.equals(other.value.pageSize);
  }
}

namespace PaginatedQuery {
  export const Schema = z.object({
    pageNumber: z.coerce.number(),
    pageSize: z.coerce.number(),
  });
  export type Value = {
    pageNumber: PageNumber;
    pageSize: PageSize;
  };
}

export { PaginatedQuery };
