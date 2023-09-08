import { isValidElement, useMemo } from "react";
import type { Widget } from "framework";
import { Col, Row } from "antd";
import { WidgetRegistry } from "../registry";
import type { EnsembleWidgetProps } from ".";

export type ColumnProps = {
  children: Widget[];
} & EnsembleWidgetProps;

export const Column: React.FC<ColumnProps> = ({ children }) => {
  const renderedChildren = useMemo(() => {
    return children.map((child, index) => {
      const result = WidgetRegistry.find(child.name);
      if (isValidElement(result)) {
        return result;
      }
      const WidgetFn = result as React.FC<unknown>;
      return <WidgetFn {...child.properties} key={index} />;
    });
  }, [children]);
  return (
    <Row>
      <Col style={{ flexDirection: "column", display: "flex" }}>
        {renderedChildren}
      </Col>
    </Row>
  );
};

WidgetRegistry.register("Column", Column);
