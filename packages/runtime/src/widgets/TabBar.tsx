import React, {
  useCallback,
  useEffect,
  useState,
  type ReactElement,
} from "react";
import { useRegisterBindings } from "@ensembleui/react-framework";
import type { Expression, EnsembleWidget } from "@ensembleui/react-framework";
import { Tabs, ConfigProvider } from "antd";
import { isNumber } from "lodash-es";
import type {
  EnsembleWidgetProps,
  EnsembleWidgetStyles,
  IconProps,
} from "../shared/types";
import { EnsembleRuntime } from "../runtime";
import { WidgetRegistry } from "../registry";
import { Icon } from "./Icon";

const widgetName = "TabBar";
const { TabPane } = Tabs;

export interface TabBarItem {
  label: Expression<string>;
  icon?: IconProps;
  widget: EnsembleWidget;
}

export interface TabStyles {
  tabNavBackgroundColor: string;
  tabBorderRadius: number;
  tabNavPadding: string;
  tabNavBorderRadius: string;
  tabNavBottomBorderShow: boolean;
  tabColor: string;
}

export interface TabBarStyles extends EnsembleWidgetStyles {
  inkBarShow: boolean;
  activeTabBackgroundColor: string;
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
  tabContentHolderBackgroundColor: string;
  tabContentHolderBorderRadius: number;
  tabContentHolderPadding: string;
}

export interface TabBarProps extends EnsembleWidgetProps<TabBarStyles> {
  id?: string;
  selectedIndex?: number;
  items: TabBarItem[];
  tabStyles?: TabStyles;
}

export const TabBar: React.FC<TabBarProps> = (props) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const { values } = useRegisterBindings({ ...props, widgetName }, props.id, {
    setSelectedIndex,
  });

  useEffect(() => {
    if (values?.selectedIndex && isNumber(values.selectedIndex)) {
      setSelectedIndex(values.selectedIndex);
    }
  }, [values?.selectedIndex]);

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
          <>
            <Icon color={icon.color} name={icon.name} size={icon.size} />
            &nbsp;
          </>
        ) : null}{" "}
        {label}
      </div>
    );
  };

  const customStyles = `
    .ant-tabs-ink-bar {
      height: 5px;
      background: transparent;
      display: ${props.styles?.inkBarShow ? "inherit" : "none"};
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
      border-bottom: ${
        props.tabStyles?.tabNavBottomBorderShow !== false
          ? `1px solid ${props.styles?.dividerColor || "grey"}`
          : "inherit"
      };
    }

    .ant-tabs-nav-list {
      width: 100%
    }

    .ant-tabs > .ant-tabs-nav {
      background-color: ${props.tabStyles?.tabNavBackgroundColor || "none"};
      border-radius: ${props.tabStyles?.tabNavBorderRadius || 0}px !important;
      padding: ${props.tabStyles?.tabNavPadding || "inherit"};
    }

    .ant-tabs {
      font-weight: ${props.styles?.tabFontWeight || "normal"};
    }

    .ant-tabs-tab {
      padding: inherit !important;
      border-radius: ${props.tabStyles?.tabBorderRadius || 0}px !important;
      background: ${props.styles?.tabBackgroundColor || "inherit"} !important;
      color: ${props.tabStyles?.tabColor || "inherit"} !important;
    }

    ${
      values?.styles?.tabPosition === "stretch"
        ? `.ant-tabs-nav-list .ant-tabs-tab:nth-last-child(2) {
      flex: 1
    }`
        : ""
    }


    .ant-tabs .ant-tabs-tab+.ant-tabs-tab {
      margin-left: 10px !important;
    }

    .ant-tabs-tab-active {
      background: ${
        props.styles?.activeTabBackgroundColor || "inherit"
      } !important;
    }

    .ant-tabs-content-holder {
      background: ${
        props.styles?.tabContentHolderBackgroundColor || "inherit"
      } !important;
      border-radius: ${
        props.styles?.tabContentHolderBorderRadius || 0
      }px !important;
      padding: ${props.styles?.tabContentHolderPadding || "unset"} !important;
    }
  `;

  const getActiveKey = (): string | undefined => {
    if (!values?.items) {
      return;
    }
    if (selectedIndex >= 0 && selectedIndex <= values.items.length) {
      return values.items[selectedIndex].label;
    }
  };

  const handleSelectedTabChange = useCallback(
    (key: string): void => {
      const tabIndex = values?.items.findIndex((tab) => tab.label === key);
      setSelectedIndex(tabIndex ?? 0);
    },
    [values?.items],
  );

  return (
    <ConfigProvider
      theme={{
        components: {
          Tabs: {
            inkBarColor: "transparent",
            itemColor: values?.styles?.inactiveTabColor ?? "grey",
            itemSelectedColor: values?.styles?.activeTabColor ?? "black",
            titleFontSize: values?.styles?.tabFontSize ?? 16,
          },
        },
      }}
    >
      <style>{customStyles}</style>
      <Tabs
        activeKey={getActiveKey()}
        onChange={handleSelectedTabChange}
        style={{ ...values?.styles }}
      >
        {values?.items.map((tabItem) => (
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

WidgetRegistry.register(widgetName, TabBar);
