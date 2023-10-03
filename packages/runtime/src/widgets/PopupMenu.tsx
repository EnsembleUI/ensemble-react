import React, { ReactNode, isValidElement, useMemo } from "react";
import { Menu, Dropdown as AntdDropdown, Button } from "antd";
import MoreVertOutlinedIcon from "@mui/icons-material/MoreVertOutlined";
import { merge } from "lodash-es";
import {
  type EnsembleWidget,
  useExecuteCode,
  useRegisterBindings,
  unwrapWidget,
} from "framework";
import { useNavigateScreen } from "../runtime/navigate";
import type { EnsembleWidgetProps } from "../util/types";
import { WidgetRegistry } from "../registry";

type PopupMenuItem = {
  label: string;
  value: string;
};

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
  if (props.widget) {
    const actualWidget = unwrapWidget(props.widget);
    const renderedChild = useMemo(() => {
      return renderWidget(actualWidget);
    }, [props.widget]);
    return (
      <AntdDropdown overlay={menuItems} trigger={["click"]}>
        <div>{renderedChild}</div>
      </AntdDropdown>
    );
  } else {
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
  }
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
