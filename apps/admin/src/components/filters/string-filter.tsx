import {
  ActionIcon,
  Combobox,
  TextInput,
  useCombobox,
} from "@mantine/core";
import type { BasicFilterProps, Mode, StringOperators } from "./types";
import { IconSearch, IconX } from "@tabler/icons-react";
import { useCallback, useState } from "react";
import { ModeCombobox } from "./mode-combobox";
import { StringOperatorCombobox } from "./string-operator-combobox";
import { StringBasicFilter } from "./string-basic-filter";

export function StringFilter({
  field,
  value,
  onChange,
  close,
  defaultOperator = "equals",
  withClearButton = false,
  mode: initial_mode = "sensitive",
  immediateOnChange,
}: BasicFilterProps<"string">) {
  const [mode, setMode] = useState<Mode>(value && value.type === "string" && value.mode ? value.mode : initial_mode);
  const [operator, setOperator] = useState<StringOperators>(value?.relation as StringOperators || defaultOperator);

  const handleModeChange = useCallback((new_mode: Mode) => {
    setMode(new_mode);
    onChange(!value || (value && (value.value as string).length === 0)
              ? undefined
              : {
                  by: field,
                  type: "string",
                  value: value.value as string,
                  relation: operator,
                  mode: new_mode,
                });
  }, [value, operator, field, onChange])

  const handleOperatorChange = useCallback((new_operator: StringOperators) => {
    setOperator(new_operator);
    onChange(!value || (value && (value.value as string).length === 0)
              ? undefined
              : {
                  by: field,
                  type: "string",
                  value: value.value as string,
                  relation: new_operator,
                  mode,
                });
  }, [value, mode, field, onChange]);

  return (
    <div className="space-y-3">
      <StringOperatorCombobox value={operator} onChange={handleOperatorChange} />
      <ModeCombobox value={mode} onChange={handleModeChange} />
      <StringBasicFilter
        field={field}
        value={value}
        onChange={onChange}
        close={close}
        defaultOperator={operator}
        withClearButton={withClearButton}
        mode={mode}
        immediateOnChange={immediateOnChange}
      />
    </div>
  );
}
