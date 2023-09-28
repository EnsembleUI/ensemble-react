import React, { useMemo } from "react";
import { WidgetRegistry } from "../registry";
import { EnsembleRuntime } from "../runtime";
import { Tabs } from "antd";
import { Widget } from "framework";

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
  console.log(props.items);

  return (
    <Tabs tabBarStyle={{ borderBottom: "1px solid #cbcbcb" }}>
      {props.items.map((tabItem) => (
        <TabPane key={tabItem.label} tab={tabItem.label}>
          {tabItem.widget &&
            EnsembleRuntime.render([
              {
                name: tabItem.widget.name,
                properties: tabItem.widget.properties,
              },
            ])}
        </TabPane>
      ))}
    </Tabs>
  );
};

WidgetRegistry.register("TabBar", TabBar);
