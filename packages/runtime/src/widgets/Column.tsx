import { useMemo } from "react";
import type { Widget } from "framework";
import { Col } from "antd";
import { WidgetRegistry } from "../registry";
import { EnsembleRuntime } from "../runtime";
import type { EnsembleWidgetProps } from ".";

export type ColumnProps = {
  children: Widget[];
} & EnsembleWidgetProps;

export const Column: React.FC<ColumnProps> = ({ children }) => {
  const renderedChildren = useMemo(() => {
    return EnsembleRuntime.render(children);
  }, [children]);
  return (
    <Col style={{ flexDirection: "column", display: "flex" }}>
      {renderedChildren}
    </Col>
  );
};

WidgetRegistry.register("Column", Column);
