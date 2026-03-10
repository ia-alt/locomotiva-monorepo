import { ValueObject } from "../../base-classes";
import { z } from "zod";
import { PaginatedQuery } from "./paginated-query";

class PaginatedResult<
  ItemJsonSchema extends z.ZodTypeAny,
  ItemValue extends { toJSON: () => z.infer<ItemJsonSchema> }
> extends ValueObject<PaginatedResult.Value<ItemValue>> {
  constructor(value: PaginatedResult.Value<ItemValue>) {
    super(value);
  }

  toJSON(): z.infer<
    ReturnType<typeof PaginatedResult.JsonSchema<ItemJsonSchema>>
  > {
    return {
      items: this.value.items.map((t) => t.toJSON()),
      pageSize: this.value.pageSize,
      currentPage: this.value.currentPage,
      pagesCount: this.value.pagesCount,
    };
  }

  equals(other: PaginatedResult<ItemJsonSchema, ItemValue>): boolean {
    if (JSON.stringify(this.toJSON()) !== JSON.stringify(other.toJSON())) {
      return false;
    }

    return true;
  }

  toString(): string {
    return `${this.value.currentPage}-${this.value.pageSize}`;
  }

  static create<T extends z.ZodTypeAny, ItemValue extends { toJSON: () => z.infer<T> }>(params: { items: ItemValue[], total: number, paginatedQuery: PaginatedQuery }): PaginatedResult<T, ItemValue> {
    return new PaginatedResult<T, ItemValue>({
      items: params.items,
      currentPage: params.paginatedQuery.pageNumber,
      pagesCount: Math.ceil(params.total / params.paginatedQuery.pageSize),
      pageSize: params.paginatedQuery.pageSize,
    });
  }
}

namespace PaginatedResult {
  export type Value<T> = {
    items: T[];
    pageSize: number;
    currentPage: number;
    pagesCount: number;
  };

  export const JsonSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
    z.object({
      items: z.array(itemSchema),
      pageSize: z.number(),
      currentPage: z.number(),
      pagesCount: z.number(),
    });
}

export { PaginatedResult };
