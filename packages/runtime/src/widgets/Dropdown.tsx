import React, { useEffect, useState } from "react";
import type { Expression } from "framework";
import { useRegisterBindings, useExecuteCode } from "framework";
import { useNavigateScreen } from "../runtime/navigate";
import { WidgetRegistry } from "../registry";
import { MenuItem, Select, InputLabel, FormControl, Box } from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";

export type MenuItems = {
  label?: string;
  value?: string;
  onTap?: {
    executeCode?: string;
    navigateScreen?: string;
  };
};

export type DropdownProps = {
  id: Expression<string>;
  labelId: Expression<string>;
  label?: Expression<string>;
  variant?: "standard" | "filled";
  displayEmpty?: boolean;
  styles?: {
    minWidth?: number | string;
    maxWidth?: number | string;
  };
  defaultValue?: string;
  menu?: MenuItems[];
};

export const Dropdown: React.FC<DropdownProps> = (props) => {
  const [code, setCode] = useState("");
  const [screen, setScreen] = useState("");
  const [dropdownValue, setDropdownValue] = React.useState(
    props.defaultValue ?? "",
  );

  const handleChange = (event: SelectChangeEvent) => {
    setDropdownValue(event.target.value as string);
  };

  const handleMenuClick = (menuItem: any) => {
    menuItem.onTap?.executeCode && setCode(menuItem.onTap?.executeCode);
    menuItem.onTap?.navigateScreen && setScreen(menuItem.onTap?.navigateScreen);
  };
  useEffect(() => {
    code && onTapCallback();
  }, [code]);
  useEffect(() => {
    screen && onNavigate();
  }, [screen]);

  const { values } = useRegisterBindings(props);
  const onTapCallback = useExecuteCode(code, values);
  const onNavigate = useNavigateScreen(screen);

  return (
    <Box
      sx={{
        minWidth: props.styles?.minWidth,
        maxWidth: props.styles?.maxWidth,
      }}
    >
      <FormControl fullWidth>
        <Select
          labelId={props.labelId}
          id={props.id}
          value={dropdownValue}
          label={!props.displayEmpty ? props.label : null}
          onChange={handleChange}
          variant={props.variant}
          displayEmpty
        >
          {props.menu &&
            props.menu?.map((menuItem) => (
              <MenuItem
                key={menuItem.value ?? menuItem.label}
                value={menuItem.value ?? menuItem.label}
                onClick={() => handleMenuClick(menuItem)}
              >
                {menuItem.label ?? menuItem.value}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </Box>
  );
};

WidgetRegistry.register("Dropdown", Dropdown);
