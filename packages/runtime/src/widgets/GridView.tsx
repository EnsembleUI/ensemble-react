import { useMemo } from "react";
import { Row } from "antd";
import { get } from "lodash-es";
import { WidgetRegistry } from "../registry";
import { EnsembleRuntime } from "../runtime";
import type { FlexboxProps } from "../util/types";
import { getColor } from "../util/utils";

export const GridView: React.FC<FlexboxProps> = (props) => {
  const renderedChildren = useMemo(() => {
    return EnsembleRuntime.render(props.children);
  }, [props.children]);

  return (
    <Row
      style={{
        flexDirection: "column",
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
    </Row>
  );
};

WidgetRegistry.register("GridView", GridView);
