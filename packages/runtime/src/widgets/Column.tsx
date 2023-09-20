import type { CSSProperties } from "react";
import { useMemo } from "react";
import { Col } from "antd";
import { get } from "lodash-es";
import { WidgetRegistry } from "../registry";
import { EnsembleRuntime } from "../runtime";
import type { FlexboxProps } from "../util/types";
import { getColor, getCrossAxis, getMainAxis } from "../util/utils";

export const Column: React.FC<FlexboxProps> = (props) => {
  const renderedChildren = useMemo(() => {
    return EnsembleRuntime.render(props.children);
  }, [props.children]);

  return (
    <Col
      style={{
        flexDirection: "column",
        justifyContent: (props.styles?.mainAxis &&
          getMainAxis(
            String(props.styles.mainAxis),
          )) as CSSProperties["justifyContent"],
        alignItems: (props.styles?.crossAxis &&
          getCrossAxis(
            String(props.styles.crossAxis),
          )) as CSSProperties["alignItems"],
        margin: props.styles?.margin,
        padding: props.styles?.padding,
        gap: props.styles?.gap,
        borderRadius: props.styles?.borderRadius,
        borderWidth: props.styles?.borderWidth,
        borderColor: props.styles?.borderColor
          ? getColor(props.styles.borderColor)
          : undefined,
        borderStyle: props.styles?.borderWidth ? "solid" : undefined,

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
