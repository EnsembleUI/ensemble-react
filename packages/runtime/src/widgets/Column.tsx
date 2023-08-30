import { useMemo } from "react";
import type { Widget } from "framework";
import { WidgetRegistry } from "../registry";

export interface ColumnProps {
  children: Widget[];
}

export const Column: React.FC<ColumnProps> = ({ children }) => {
  const renderedChildren = useMemo(() => {
    return children.map((child, index) => {
      const widgetFn = WidgetRegistry.find(child.name);
      return widgetFn?.({ ...child.properties, key: index });
    });
  }, [children]);
  return <div>{renderedChildren}</div>;
};

WidgetRegistry.register("Column", Column);
