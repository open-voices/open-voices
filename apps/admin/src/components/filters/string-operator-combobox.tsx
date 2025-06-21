import { Combobox, TextInput, useCombobox } from "@mantine/core";
import { useState, type FC } from "react";
import type { StringOperators } from "./types";
import { title } from "radash";

interface ComboboxProps {
  value: StringOperators;
  onChange: (value: StringOperators) => void;
}

const operators = [
  "equals",
  "contains",
  "starts_with",
  "ends_with",
  "in",
  "not_equals",
  "not_contains",
  "not_starts_with",
  "not_ends_with",
  "not_in",
] as StringOperators[];

const operatorNames: Record<StringOperators, string> = {
  equals: "Equals",
  contains: "Containing",
  starts_with: "Starts with",
  ends_with: "Ends with",
  in: "In",
  not_equals: "Not equals",
  not_contains: "Not containing",
  not_starts_with: "Not starting with",
  not_ends_with: "Not ending with",
  not_in: "Not in",
};

export const StringOperatorCombobox: FC<ComboboxProps> = ({ value, onChange }) => {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });
  const [search, setSearch] = useState<string>(operatorNames[value] || value);

  const shouldFilterOptions = operators.every((item) => item !== search);
  const filteredOptions = shouldFilterOptions
    ? operators.filter((item) =>
        item.toLowerCase().includes(search.toLowerCase().trim())
      )
    : operators;

  return (
    <Combobox
      store={combobox}
      withinPortal={false}
      onOptionSubmit={(val) => {
        onChange(val as StringOperators);
        setSearch(operatorNames[val as StringOperators] || val);
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <TextInput
          label={"Select filter operator"}
          rightSection={<Combobox.Chevron />}
          value={search}
          onChange={(event) => {
            combobox.openDropdown();
            combobox.updateSelectedOptionIndex();
            setSearch(operatorNames[event.currentTarget.value as StringOperators] || event.currentTarget.value);
          }}
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
          onBlur={() => {
            combobox.closeDropdown();
            setSearch(operatorNames[value as StringOperators] || "");
          }}
          placeholder="Search filter operator"
          rightSectionPointerEvents="none"
          tabIndex={-1}
        />
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((item) => (
              <Combobox.Option value={item} key={item}>
                {operatorNames[item]}
              </Combobox.Option>
            ))
          ) : (
            <Combobox.Empty>Nothing found</Combobox.Empty>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};
