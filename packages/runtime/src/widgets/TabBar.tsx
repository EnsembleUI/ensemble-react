import React, { useMemo, useEffect } from "react";
import { WidgetRegistry } from "../registry";
import { EnsembleRuntime } from "../runtime";
import { Tabs, ConfigProvider } from "antd";
import { get, head, isArray, isEmpty, isObject, map, set } from "lodash-es";
import { Widget, unwrapWidget } from "framework";
import { useFetcher } from "react-router-dom";

const { TabPane } = Tabs;

export type items = {
  label: string;
  icon?: string;
  widget: Widget;
};
export type TabBarProps = {
  id?: string;
  selectedIndex?: number;
  items: items[];
};
export const TabBar: React.FC<TabBarProps> = (props) => {
  return (
    <ConfigProvider
      theme={{
        components: {
          Tabs: {
            inkBarColor: "transparent",
            //colorPrimary: "#00b96b",
            itemColor: "green",
            //itemActiveColor: "blue",
            itemSelectedColor: "black",
            titleFontSize: 16,
            horizontalItemPadding: "20px 20px",
          },
        },
      }}
    >
      <style>
        {`
          .ant-tabs {
            font-weight: bold;
          }
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
            height: 5px;
            background: red;
            width: 20px;
            transform: translateX(-50%);
          }
          .ant-tabs-top >.ant-tabs-nav::before {
            border-bottom: 2px solid green;
          }
          .ant-tabs >.ant-tabs-nav {
              background-color: pink;
          }
        `}
      </style>
      <Tabs
        tabBarGutter={60}
        indicatorSize={60}

        // tabBarStyle={{
        //   borderBottom: "1px solid #cbcbcb",
        //   color: "blueviolet",
        //   fontWeight: "bolder",
        //   backgroundColor: "pink",
        //   WebkitTextFillColor: "yellow",
        // }}
      >
        {props.items.map((tabItem) => (
          <TabPane key={tabItem.label} tab={tabItem.label} closeIcon= {"Person"}>
            {tabItem.widget && EnsembleRuntime.render([tabItem.widget])}
          </TabPane>
        ))}
      </Tabs>
    </ConfigProvider>
  );
};

WidgetRegistry.register("TabBar", TabBar);
