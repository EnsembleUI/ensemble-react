import { useMemo } from "react";
import type { Widget } from "framework";
import { WidgetRegistry } from "../registry";
import type { EnsembleWidgetProps } from ".";

export type ColumnProps = {
  children: Widget[];
} & EnsembleWidgetProps;

export const Column: React.FC<ColumnProps> = ({ children }) => {
  const renderedChildren = useMemo(() => {
    return children.map((child, index) => {
      const WidgetFn = WidgetRegistry.find(child.name);
      if (!WidgetFn) {
        return null;
      }
      return <WidgetFn {...child.properties} key={index} />;
    });
  }, [children]);
  return <div>{renderedChildren}</div>;
};

WidgetRegistry.register("Column", Column);
