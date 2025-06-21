import type { ADVANCED_QUERY_SCHEMA } from "@open-voices/validation/advanced-schemas";
import type z from "zod/v4";

export type FilterType = "string" | "number" | "boolean" | "date";

export type ClassifyBasedOnType<T extends FilterType> = T extends "string"
  ? string
  : T extends "number"
    ? number
    : T extends "boolean"
      ? boolean
      : T extends "date"
        ? Date
        : never;

export type StringOperators =
  | `equals`
  | `contains`
  | `starts_with`
  | `ends_with`
  | `not_equals`
  | `not_contains`
  | `not_starts_with`
  | `not_ends_with`;
export type NumberOperators =
  | `equals`
  | `lt`
  | `lte`
  | `gt`
  | `gte`
  | `not_equals`
  | `not_lt`
  | `not_lte`
  | `not_gt`
  | `not_gte`;
export type BooleanOperators = `equals`;
export type DateOperators =
  | `equals`
  | `lt`
  | `lte`
  | `gt`
  | `gte`
  | `not_equals`
  | `not_lt`
  | `not_lte`
  | `not_gt`
  | `not_gte`;

export type FilterOperators<T extends FilterType> = T extends "string"
  ? StringOperators
  : T extends "number"
    ? NumberOperators
    : T extends "boolean"
      ? BooleanOperators
      : T extends "date"
        ? DateOperators
        : never;

export type FilterInterface = NonNullable<
  z.infer<typeof ADVANCED_QUERY_SCHEMA>["filters"]
>[number];
export type Mode = "sensitive" | "insensitive";

export interface FilterProps<T extends FilterType> {
  _type: T;
  field: string;
  value: FilterInterface | undefined;
  onChange: (value: FilterInterface | undefined) => void;
  close: () => void;

  defaultOperator?: FilterOperators<T>;
  operatorSubset?: FilterOperators<T>[];
  withAdvancedControls?: boolean;
  withClearButton?: boolean;
  mode?: Mode;
}

export interface BasicFilterProps<T extends FilterType>
  extends Omit<
    FilterProps<T>,
    "_type" | "operatorSubset" | "withAdvancedControls"
  > {
  onChange: (value: FilterInterface | undefined) => void;
  immediateOnChange: (value: FilterInterface | undefined) => void;
}
