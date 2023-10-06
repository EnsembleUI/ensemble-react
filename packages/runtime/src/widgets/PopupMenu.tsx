import React, { useEffect, useState } from "react";
import { Menu, Dropdown as AntdDropdown } from "antd";
import { cloneDeep } from "lodash-es";
import { type EnsembleWidget, unwrapWidget } from "framework";
import type { EnsembleWidgetProps } from "../util/types";
import { WidgetRegistry } from "../registry";
import { useEnsembleAction } from "../runtime/hooks/useEnsembleAction";
import { EnsembleRuntime } from "../runtime";

interface PopupMenuItem {
  label: string;
  value: string;
}

interface PopupMenuStyles {
  backgroundColor: string;
  borderRadius: string;
  borderColor: string;
  borderWidth: string;
}
type PopupMenuProps = {
  [key: string]: unknown;
  items: PopupMenuItem[];
  widget?: Record<string, unknown>;
  styles?: PopupMenuStyles;
  onItemSelect?: {
    executeCode?: string;
    navigateScreen?: string;
  };
} & EnsembleWidgetProps;

export const PopupMenu: React.FC<PopupMenuProps> = (props) => {
  const action = useEnsembleAction(props.onItemSelect);
  const [widgetProps, setWidgetProps] = useState<EnsembleWidget>();
  const menuItems = (
    <Menu>
      {props.items.map((item) => (
        <Menu.Item key={item.value} onClick={() => action?.callback(item)}>
          {item.label}
        </Menu.Item>
      ))}
    </Menu>
  );

  useEffect((): void => {
    if (!props.widget) {
      return;
    }
    // clone value so we're not updating the yaml doc
    const widget = cloneDeep(props.widget);
    const actualWidget = unwrapWidget(widget);
    setWidgetProps(actualWidget);
    // Only run once
  }, []);

  return (
    <>
      <AntdDropdown overlay={menuItems} trigger={["click"]}>
        <div>{widgetProps ? EnsembleRuntime.render([widgetProps]) : null}</div>
      </AntdDropdown>
      {action && "Modal" in action ? action.Modal : null}
    </>
  );
};

WidgetRegistry.register("PopupMenu", PopupMenu);
