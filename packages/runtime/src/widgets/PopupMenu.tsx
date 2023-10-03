import type { ReactNode } from "react";
import React, { isValidElement, useEffect, useMemo, useState } from "react";
import { Menu, Dropdown as AntdDropdown, Button } from "antd";
import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";
import { cloneDeep, merge } from "lodash-es";
import {
  type EnsembleWidget,
  useExecuteCode,
  useRegisterBindings,
  unwrapWidget,
} from "framework";
import { useNavigateScreen } from "../runtime/navigate";
import type { EnsembleWidgetProps } from "../util/types";
import { WidgetRegistry } from "../registry";

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

const defaultStyles: PopupMenuStyles = {
  backgroundColor: "transparent",
  borderRadius: "50%",
  borderWidth: "1px",
  borderColor: "transparent",
};
export const PopupMenu: React.FC<PopupMenuProps> = (props) => {
  const onItemSelect = props.onItemSelect?.executeCode;
  const mergedStyles = merge(defaultStyles, props.styles);
  const { values } = useRegisterBindings(props, props.id);
  const onTapCallback = useExecuteCode(onItemSelect, values);
  const onNavigate = useNavigateScreen(props.onItemSelect?.navigateScreen);
  const [widgetProps, setWidgetProps] = useState<EnsembleWidget>();
  const menuItems = (
    <Menu>
      {props.items.map((item) => (
        <Menu.Item
          key={item.value}
          onClick={onItemSelect ? onTapCallback : onNavigate}
        >
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

  const renderedChild = useMemo(() => {
    if (!widgetProps) {
      return null;
    }
    return renderWidget(widgetProps);
  }, [widgetProps]);
  return (
    <AntdDropdown overlay={menuItems} trigger={["click"]}>
      <div>{renderedChild}</div>
    </AntdDropdown>
  );
  return (
    <AntdDropdown overlay={menuItems} trigger={["click"]}>
      <Button
        icon={<MoreVertOutlinedIcon />}
        style={{
          ...mergedStyles,
        }}
      />
    </AntdDropdown>
  );
};

WidgetRegistry.register("PopupMenu", PopupMenu);

function renderWidget(widget: EnsembleWidget): ReactNode {
  const result = WidgetRegistry.find(widget.name);
  if (isValidElement(result)) {
    return result;
  }
  const WidgetFn = result as React.FC<unknown>;
  return <WidgetFn {...widget.properties} />;
}
