import React from "react";
import type { Expression } from "framework";
import { useRegisterBindings, useExecuteCode } from "framework";
import { useNavigateScreen } from "../runtime/navigate";
import { WidgetRegistry } from "../registry";
import { MenuItem, Select, FormControl } from "@mui/material";
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
  autoComplete: boolean;
  onChange?: {
    executeCode?: string;
    navigateScreen?: string;
  };
  styles?: {
    minWidth?: number | string;
    maxWidth?: number | string;
    variant?: "standard" | "filled" | "outlined";
    contentPadding: string | number;
    fillColor: string;
    borderRadius: number;
    borderWidth: number;
    borderColor: string;
    disabledBorderColor: string;
    errorBorderColor: string;
    focusedBorderColor: string;
    focusedErrorBorderColor: string;
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
    },
  );

  const onTapCallback = useExecuteCode(
    props.onChange?.executeCode || "",
    values,
  );
  const onNavigate = useNavigateScreen(props.onChange?.navigateScreen || "");

  const handleChange = (event: SelectChangeEvent) => {
    setDropdownValue(event.target.value as string);
    props.onChange?.executeCode && onTapCallback();
    props.onChange?.navigateScreen && onNavigate();
  };

  return (
    <FormControl
      sx={{
        m: 1,
        minWidth: props.styles?.minWidth ?? 120,
        maxWidth: props.styles?.maxWidth ?? 120,
      }}
    >
      <Select
        value={dropdownValue}
        id={props.id}
        onChange={handleChange}
        required={props.required ?? true}
        variant={props.styles?.variant ?? "outlined"}
        style={{
          borderRadius: props.styles?.borderRadius,
          borderWidth: `${props.styles?.borderWidth} !important`,
          borderColor: props.required
            ? props.styles?.borderColor
            : props.styles?.disabledBorderColor,
        }}
      >
        <MenuItem value={props.hintText ?? "None"} disabled>
          <em>{props.hintText ?? "None"}</em>
        </MenuItem>
        {props.menu &&
          props.menu?.map((menuItem) => {
            const itemValue =
              typeof menuItem === "string" ? menuItem : menuItem.value;
            const itemLabel =
              typeof menuItem === "string" ? menuItem : menuItem.label;
            return (
              <MenuItem
                key={itemValue}
                value={itemValue}
                style={{ padding: props.styles?.contentPadding ?? 0 }}
              >
                {itemLabel}
              </MenuItem>
            );
          })}
      </Select>
    </FormControl>
  );
};

WidgetRegistry.register("Dropdown", Dropdown);
