import React from "react";
import { WidgetRegistry } from "../registry";
import { EnsembleRuntime } from "../runtime";
import { Tabs, ConfigProvider } from "antd";
import { EnsembleWidget } from "framework";
import { IconProps } from "../util/types";
import { Icon } from "./Icon";
import type { Expression } from "framework";

const { TabPane } = Tabs;

export type TabBarItem = {
  label: Expression<string>;
  icon?: IconProps;
  widget: EnsembleWidget;
};
export type TabBarProps = {
  id?: string;
  selectedIndex?: number;
  items: TabBarItem[];
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

    const setDefaultSelectedTab = (() => {
        if (props.selectedIndex &&  props.selectedIndex <= props.items.length) {
            return props.items[props.selectedIndex].label;
        }
        return props.items[0].label;
    });

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
      <Tabs defaultActiveKey={setDefaultSelectedTab()}>
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
