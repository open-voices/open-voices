import { useDebouncedCallback } from "@mantine/hooks";
import type { BasicFilterProps, FilterProps, FilterType } from "./types";
import { StringBasicFilter } from "./string-basic-filter";
import { StringFilter } from "./string-filter";

export function Filter<T extends FilterType>(props: FilterProps<T>) {
  const debouncedOnChange = useDebouncedCallback(props.onChange, {
    delay: 250,
    flushOnUnmount: true,
  });

  if (props._type === "string") {
    if (!props.withAdvancedControls) {
      return (
        <StringBasicFilter
          {...props}
          defaultOperator={
            (props.defaultOperator ??
              "equals") as BasicFilterProps<"string">["defaultOperator"]
          }
          immediateOnChange={props.onChange}
          onChange={debouncedOnChange}
        />
      );
    }
    return (
      <StringFilter
        {...props}
        defaultOperator={
          (props.defaultOperator ??
            "equals") as BasicFilterProps<"string">["defaultOperator"]
        }
        onChange={debouncedOnChange}
        immediateOnChange={props.onChange}
      />
    );
  }

  if (props._type === "number") {
    // TODO: Implement NumberFilter component
    return <>Number Filter for {props.field}</>;
  }

  if (props._type === "boolean") {
    // TODO: Implement BooleanFilter component
    return <>Boolean Filter for {props.field}</>;
  }

  // TODO: Implement DateFilter component
  return <>Date Filter for {props.field}</>;
}
