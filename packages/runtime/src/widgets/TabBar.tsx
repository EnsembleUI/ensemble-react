import React, { type ReactElement } from "react";
import { useRegisterBindings } from "@ensembleui/react-framework";
import type { Expression, EnsembleWidget } from "@ensembleui/react-framework";
import { Tabs, ConfigProvider } from "antd";
import { zip } from "lodash-es";
import type {
  EnsembleWidgetProps,
  EnsembleWidgetStyles,
  IconProps,
} from "../shared/types";
import { EnsembleRuntime } from "../runtime";
import { WidgetRegistry } from "../registry";
import { Icon } from "./Icon";

const { TabPane } = Tabs;

export interface TabBarItem {
  label: Expression<string>;
  icon?: IconProps;
  widget: EnsembleWidget;
}

export interface TabBarStyles extends EnsembleWidgetStyles {
  tabPosition: "start" | "stretch";
  tabPadding: string;
  tabFontSize: number;
  tabFontWeight: string;
  tabBackgroundColor: string;
  activeTabColor: string;
  dividerColor: string;
  inactiveTabColor: string;
  indicatorColor: string;
  indicatorThickness: string;
}
export interface TabBarProps extends EnsembleWidgetProps<TabBarStyles> {
  id?: string;
  selectedIndex?: number;
  items: TabBarItem[];
}

export const TabBar: React.FC<TabBarProps> = (props) => {
  const bindings = {
    ...props,
    items: props.items.map(({ label, icon }) => ({
      label,
      icon,
    })),
  };
  const { values } = useRegisterBindings({ ...bindings }, props.id);
  const tabs = zip(values?.items ?? [], props.items);
  const renderLabel = (label: string, icon?: IconProps): ReactElement => {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: props.styles?.tabPadding ?? "5px 5px 5px 5px",
        }}
      >
        {icon ? (
          <Icon color={icon.color} name={icon.name} size={icon.size} />
        ) : null}{" "}
        &nbsp; {label}
      </div>
    );
  };

  const customStyles = `
    .ant-tabs-ink-bar {
      height: 5px;
      background: transparent;
    }

    .ant-tabs-ink-bar::after {
      content: " ";
      position: absolute;
      left: 50%;
      right: 0;
      bottom: 0;
      height: ${props.styles?.indicatorThickness || "3px"};
      background: ${props.styles?.indicatorColor || "black"};
      width: 100%;
      transform: translateX(-50%);
    }

    .ant-tabs-top > .ant-tabs-nav::before {
      border-bottom: 1px solid ${props.styles?.dividerColor || "grey"};
    }

    .ant-tabs > .ant-tabs-nav {
      background-color: ${props.styles?.tabBackgroundColor || "none"};
    }

    .ant-tabs {
      font-weight: ${props.styles?.tabFontWeight || "normal"};
    }
  `;

  const setDefaultSelectedTab = () => {
    if (props.selectedIndex && props.selectedIndex <= props.items.length) {
      return props.items[props.selectedIndex].label;
    }
    return props.items[0].label;
  };
  return (
    <ConfigProvider
      theme={{
        components: {
          Tabs: {
            inkBarColor: "transparent",
            itemColor: props.styles?.inactiveTabColor ?? "grey",
            itemSelectedColor: props.styles?.activeTabColor ?? "black",
            titleFontSize: props.styles?.tabFontSize ?? 16,
          },
        },
      }}
    >
      <style>{customStyles}</style>
      <Tabs
        defaultActiveKey={setDefaultSelectedTab()}
        style={{ ...values?.styles }}
      >
        {tabs.map(([tabItem, widget]) => (
          <TabPane
            key={tabItem?.label}
            tab={renderLabel(tabItem?.label ?? "", tabItem?.icon)}
          >
            {widget?.widget ? EnsembleRuntime.render([widget.widget]) : null}
          </TabPane>
        ))}
      </Tabs>
    </ConfigProvider>
  );
};

WidgetRegistry.register("TabBar", TabBar);
