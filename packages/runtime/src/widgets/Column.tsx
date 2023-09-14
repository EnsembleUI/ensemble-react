import { useMemo } from "react";
import type { Widget } from "framework";
import { Col } from "antd";
import { get } from "lodash-es";
import { WidgetRegistry } from "../registry";
import { EnsembleRuntime } from "../runtime";
import type { EnsembleWidgetProps } from ".";

export type ColumnProps = {
  children: Widget[];
} & EnsembleWidgetProps;

export const Column: React.FC<ColumnProps> = ({ children, ...props }) => {
  const renderedChildren = useMemo(() => {
    return EnsembleRuntime.render(children);
  }, [children]);
  return (
    <Col
      style={{
        flexDirection: "column",
        display: "flex",
        flexGrow: 1,
        ...(get(props, "styles") as object),
      }}
    >
      {renderedChildren}
    </Col>
  );
};

WidgetRegistry.register("Column", Column);
