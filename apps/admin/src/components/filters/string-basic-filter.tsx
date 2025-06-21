import { ActionIcon, TextInput } from "@mantine/core";
import type { BasicFilterProps } from "./types";
import { IconSearch, IconX } from "@tabler/icons-react";

export function StringBasicFilter({
  field,
  value,
  onChange,
  close,
  defaultOperator = "equals",
  withClearButton = false,
  mode = "sensitive",
  immediateOnChange,
}: BasicFilterProps<"string">) {
  return (
    <TextInput
      label={`Filter for ${field}`}
      placeholder={`Filter by ${field}`}
      value={value?.value as string | undefined}
      onChange={(e) =>
        onChange(
          e.currentTarget.value.length === 0
            ? undefined
            : {
                by: field,
                type: "string",
                value: e.currentTarget.value,
                relation: defaultOperator as any,
                mode,
              }
        )
      }
      leftSection={<IconSearch size={16} />}
      rightSection={
        withClearButton && (
          <ActionIcon
            size="sm"
            variant="transparent"
            c="dimmed"
            onClick={() => {
              immediateOnChange(undefined);
              close();
            }}
          >
            <IconX size={14} />
          </ActionIcon>
        )
      }
    />
  );
}
