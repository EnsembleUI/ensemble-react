import { useMemo } from "react";
import type { Widget } from "framework";
import { Row as AntRow } from "antd";
import { WidgetRegistry } from "../registry";
import { EnsembleRuntime } from "../runtime";
import type { EnsembleWidgetProps } from ".";

export type RowProps = {
  children: Widget[];
} & EnsembleWidgetProps;

export const Row: React.FC<RowProps> = ({ children }) => {
  const renderedChildren = useMemo(() => {
    return EnsembleRuntime.render(children);
  }, [children]);
  return <AntRow style={{ flexGrow: 1 }}>{renderedChildren}</AntRow>;
};

WidgetRegistry.register("Row", Row);
