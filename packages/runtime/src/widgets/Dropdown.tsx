import React, { useEffect, useState } from "react";
import type { Expression } from "framework";
import { useRegisterBindings, useExecuteCode } from "framework";
import { useNavigateScreen } from "../runtime/navigate";
import { WidgetRegistry } from "../registry";
import { MenuItem, Select, InputLabel, FormControl, Box } from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";

export type DropdownItem = {
  label: string;
  value: string;
};

export type DropdownProps = {
  id: Expression<string>;
  label?: Expression<string>;
  labelHint?: Expression<string>;
  hintText?: Expression<string>;
  required?: boolean;
  enabled?: boolean;
  variant?: "standard" | "filled";
  onChange?: {
    executeCode?: string;
    navigateScreen?: string;
  };
  styles?: {
    minWidth?: number | string;
    maxWidth?: number | string;
  };
  defaultValue?: string;
  menu?: (string | DropdownItem)[];
};

export const Dropdown: React.FC<DropdownProps> = (props) => {
  const [dropdownValue, setDropdownValue] = React.useState(props.hintText);
  const { values } = useRegisterBindings(
    { ...props, dropdownValue },
    props.id,
    {
      setDropdownValue,
    }
  );
  //const { values } = useRegisterBindings(props);
  const onTapCallback = useExecuteCode(
    props.onChange?.executeCode || "",
    values
  );
  const onNavigate = useNavigateScreen(props.onChange?.navigateScreen || "");

  const handleChange = (event: SelectChangeEvent) => {
    setDropdownValue(event.target.value as string);
    props.onChange?.executeCode && onTapCallback();
    props.onChange?.navigateScreen && onNavigate();
  };

  return (
    <FormControl sx={{ m: 1, minWidth: 120 }}>
      <Select
        value={dropdownValue}
        id={props.id}
        onChange={handleChange}
        required={props.required}
      >
        <MenuItem value={props.hintText}>
          <em>None</em>
        </MenuItem>
        {props.menu &&
          props.menu?.map((menuItem) => {
            const itemValue =
              typeof menuItem === "string" ? menuItem : menuItem.value;
            const itemLabel =
              typeof menuItem === "string" ? menuItem : menuItem.label;
            return (
              <MenuItem key={itemValue} value={itemValue}>
                {itemLabel}
              </MenuItem>
            );
          })}
      </Select>
    </FormControl>
  );
};

WidgetRegistry.register("Dropdown", Dropdown);
