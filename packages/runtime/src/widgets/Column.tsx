import { useMemo } from "react";
import { Col } from "antd";
import { WidgetRegistry } from "../registry";
import { EnsembleRuntime } from "../runtime";
import { getCrossAxis, getMainAxis } from "../util/utils";
import type { FlexboxProps } from "../util/types";

export const Column: React.FC<FlexboxProps> = (props) => {
  const renderedChildren = useMemo(() => {
    return EnsembleRuntime.render(props.children);
  }, [props.children]);

  return (
    <Col
      style={{
        flexDirection: "column",
        display: "flex",
        justifyContent: props.mainAxis && getMainAxis(props.mainAxis),
        alignItems: props.crossAxis && getCrossAxis(props.crossAxis),
        gap: props.gap,
      }}
    >
      {renderedChildren}
    </Col>
  );
};

WidgetRegistry.register("Column", Column);
