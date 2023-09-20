import React from "react";
import { Menu, Dropdown as AntdDropdown, Button } from "antd";
import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";
import { WidgetRegistry } from "../registry";

type DropdownItem = {
  label: string;
  key: string;
};

type DropdownProps = {
  items: DropdownItem[];
  styles?: {
    backgroundColor: string;
    borderRadius: string;
    borderColor: string;
    borderWidth: string;
  };
};

export const Dropdown: React.FC<DropdownProps> = (props) => {
  // const menuItems: MenuProps = {
  //   items: props.items.map((item) => ({
  //     key: item.key,
  //     element: <span>{item.label}</span>,
  //   })),
  //   onClick: (e) => {
  //     // Handle menu item click
  //   },
  // };

  const menuItems = (
    <Menu>
      {props.items.map((item) => (
        <Menu.Item key={item.key}>{item.label}</Menu.Item>
      ))}
    </Menu>
  );

  return (
    <AntdDropdown overlay={menuItems} trigger={["click"]}>
      <Button
        style={{
          backgroundColor: props.styles?.backgroundColor ?? "transparent",
          borderRadius: props.styles?.borderRadius ?? "50%",
          borderWidth: props.styles?.borderWidth ?? "1px",
          borderColor: props.styles?.borderColor ?? "transparent",
        }}
        icon={<MoreVertOutlinedIcon />}
      />
    </AntdDropdown>
  );
};

WidgetRegistry.register("Dropdown", Dropdown);
