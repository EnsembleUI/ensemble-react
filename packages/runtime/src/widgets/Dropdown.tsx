import React from "react";
import { Menu, Dropdown as AntdDropdown, Button } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { WidgetRegistry } from "../registry";

type DropdownItem = {
  label: string;
  key: string;
};

type DropdownProps = {
  items: DropdownItem[];
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
    <Button icon={<EllipsisOutlined />} />
  </AntdDropdown>
);
};

WidgetRegistry.register("Dropdown", Dropdown);