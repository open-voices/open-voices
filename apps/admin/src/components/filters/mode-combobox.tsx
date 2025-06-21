import { Combobox, TextInput, useCombobox } from "@mantine/core";
import { useState, type FC } from "react";
import type { Mode } from "./types";
import { title } from "radash";

interface ComboboxProps {
  value: Mode;
  onChange: (value: Mode) => void;
}

const modes = ["sensitive", "insensitive"] as Mode[];

export const ModeCombobox: FC<ComboboxProps> = ({ value, onChange }) => {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });
  const [search, setSearch] = useState<string>(title(value));

  const shouldFilterOptions = modes.every((item) => item !== search);
  const filteredOptions = shouldFilterOptions
    ? modes.filter((item) =>
        item.toLowerCase().includes(search.toLowerCase().trim())
      )
    : modes;

  return (
    <Combobox
      store={combobox}
      withinPortal={false}
      onOptionSubmit={(val) => {
        onChange(val as Mode);
        setSearch(title(val));
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <TextInput
          label={"Filter mode"}
          rightSection={<Combobox.Chevron />}
          value={search}
          onChange={(event) => {
            combobox.openDropdown();
            combobox.updateSelectedOptionIndex();
            setSearch(title(event.currentTarget.value));
          }}
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
          onBlur={() => {
            combobox.closeDropdown();
            setSearch(title(value) || "");
          }}
          placeholder="Search mode"
          rightSectionPointerEvents="none"
          tabIndex={-1}
        />
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((item) => (
              <Combobox.Option value={item} key={item}>
                {title(item)}
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
