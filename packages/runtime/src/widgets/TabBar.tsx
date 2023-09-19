import { WidgetRegistry } from "../registry";
import { EnsembleRuntime } from "../runtime";
import { Tabs } from "antd";
import { Widget } from "framework";
const { TabPane } = Tabs;
import "./index.css";
export type TabItem = {
  key: string;
  label: string;
  children?: Widget[];
  
};
export type TabBarProps = {
  TabPane: TabItem[];
}
export const TabBar: React.FC<TabBarProps> = (props) => {
  // const renderedChildren = useMemo(() => {
  //   return EnsembleRuntime.render(props.children);
  // }, [props.children]);
  const renderChildren = (children: Widget[]) => {
    return EnsembleRuntime.render(children);
  };
  
  return (
    <Tabs
      className="my-tab-bar"
      tabBarStyle={{ borderBottom: "1px solid #cbcbcb" }}
    >
      {props.TabPane.map((tabItem) => (
        <TabPane key={tabItem.key} tab={tabItem.label}>
          {tabItem.children && renderChildren(tabItem.children)}
        </TabPane>
      ))}
    </Tabs>
  );
};

WidgetRegistry.register("TabBar", TabBar);
