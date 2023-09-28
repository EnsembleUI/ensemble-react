import React, { useMemo, useEffect } from "react";
import { WidgetRegistry } from "../registry";
import { EnsembleRuntime } from "../runtime";
import { Tabs } from "antd";
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
    <Tabs tabBarStyle={{ borderBottom: "1px solid #cbcbcb" }}>
      {props.items.map((tabItem) => (
        <TabPane key={tabItem.label} tab={tabItem.label}>
          {tabItem.widget && EnsembleRuntime.render([tabItem.widget])}
        </TabPane>
      ))}
    </Tabs>
  );
};

WidgetRegistry.register("TabBar", TabBar);
