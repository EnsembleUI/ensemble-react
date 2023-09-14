import { useMemo } from "react";
import { Col } from "antd";
import { get } from "lodash-es";
import { WidgetRegistry } from "../registry";
import { EnsembleRuntime } from "../runtime";
import type { FlexboxProps } from "../util/types";
import {getColor, getCrossAxis, getMainAxis} from "../util/utils";

export const Column: React.FC<FlexboxProps> = (props) => {
  const renderedChildren = useMemo(() => {
    return EnsembleRuntime.render(props.children);
  }, [props.children]);

  return (
    <Col
      style={{
        flexDirection: "column",
        justifyContent: props.mainAxis && getMainAxis(props.mainAxis),
        alignItems: props.crossAxis && getCrossAxis(props.crossAxis),
        margin: props.margin,
        padding: props.padding,
        gap: props.gap,
        borderRadius: props.borderRadius,
        borderWidth: props.borderWidth,
        borderColor: props.borderColor
          ? getColor(props.borderColor)
          : undefined,
        borderStyle: props.borderWidth ? "solid" : undefined,

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
