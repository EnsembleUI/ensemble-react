import React from "react";
import { WidgetRegistry } from "../registry";
import { EnsembleRuntime } from "../runtime";
import { Tabs, ConfigProvider } from "antd";
import { Widget } from "framework";
import { IconProps } from "../util/types";
import { Icon } from "./Icon";
const { TabPane } = Tabs;

export type items = {
  label: string;
  icon?: IconProps;
  widget: Widget;
};
export type TabBarProps = {
  id?: string;
  selectedIndex?: string;
  items: items[];
  styles?: {
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
  };
};
export const TabBar: React.FC<TabBarProps> = (props) => {
  const renderLabel = (label: string, icon?: IconProps) => {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: props.styles?.tabPadding ?? "5px 5px 5px 5px",
        }}
      >
        {icon && <Icon name={icon.name} size={icon.size} color={icon.color} />}{" "}
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
      background-color: ${props.styles?.tabBackgroundColor || "white"};
    }

    .ant-tabs {
      font-weight: ${props.styles?.tabFontWeight || "normal"};
    }
  `;

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
      <Tabs defaultActiveKey={props.selectedIndex}>
        {props.items.map((tabItem) => (
          <TabPane
            key={tabItem.label}
            tab={renderLabel(tabItem.label, tabItem.icon)}
          >
            {tabItem.widget && EnsembleRuntime.render([tabItem.widget])}
          </TabPane>
        ))}
      </Tabs>
    </ConfigProvider>
  );
};

WidgetRegistry.register("TabBar", TabBar);
