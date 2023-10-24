import React, { type ReactElement } from "react";
import {
  useRegisterBindings,
  useScreenContext,
  evaluate,
} from "@ensembleui/react-framework";
import type {
  Expression,
  ScreenContextDefinition,
  EnsembleWidget,
} from "@ensembleui/react-framework";
import { Tabs, ConfigProvider } from "antd";
import { type IconProps } from "../util/types";
import { EnsembleRuntime } from "../runtime";
import { WidgetRegistry } from "../registry";
import { Icon } from "./Icon";

const { TabPane } = Tabs;

export interface TabBarItem {
  label: Expression<string>;
  icon?: IconProps;
  widget: EnsembleWidget;
}
export interface TabBarProps {
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
}
export const TabBar: React.FC<TabBarProps> = (props) => {
  const { values } = useRegisterBindings({ ...props }, props.id);
  const context = useScreenContext();
  const renderLabel = (
    label: Expression<string>,
    icon?: IconProps,
  ): ReactElement => {
    let labelEvaluated = "";
    if (containsExpression(label)) {
      const cleanedExpression = label.replace(/\${|}/g, "");
      labelEvaluated = evaluate(
        context as ScreenContextDefinition,
        cleanedExpression,
      ) as string;
    }
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
        &nbsp; {labelEvaluated ? labelEvaluated : label}
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
      <Tabs defaultActiveKey={setDefaultSelectedTab()}>
        {values.items.map((tabItem) => (
          <TabPane
            key={tabItem.label}
            tab={renderLabel(tabItem.label, tabItem.icon)}
          >
            {tabItem.widget ? EnsembleRuntime.render([tabItem.widget]) : null}
          </TabPane>
        ))}
      </Tabs>
    </ConfigProvider>
  );
};

WidgetRegistry.register("TabBar", TabBar);

function containsExpression(str: string): boolean {
  // Regular expression to match expressions within `${}`
  const expressionPattern = /\${[^}]*}/;

  // Check if the string contains the expression pattern
  return expressionPattern.test(str);
}
