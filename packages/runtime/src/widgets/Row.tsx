import { useMemo } from "react";
import { Row as AntRow } from "antd";
import { get } from "lodash-es";
import { WidgetRegistry } from "../registry";
import { EnsembleRuntime } from "../runtime";
import { getColor, getCrossAxis, getMainAxis } from "../util/utils";
import type { FlexboxProps } from "../util/types";

export const Row: React.FC<FlexboxProps> = (props) => {
  const renderedChildren = useMemo(() => {
    return EnsembleRuntime.render(props.children);
  }, [props.children]);
  return (
    <AntRow
      style={{
        flexFlow: "nowrap",
        justifyContent: props.mainAxis && getMainAxis(props.mainAxis),
        alignItems: props.crossAxis && getCrossAxis(props.crossAxis),
        margin: props.margin,
        padding: props.padding,
        gap: props.gap,
        borderRadius: props.styles?.borderRadius,
        borderWidth: props.styles?.borderWidth,
        borderColor: props.styles?.borderColor
          ? getColor(props.styles.borderColor)
          : undefined,
        borderStyle: props.styles?.borderWidth ? "solid" : undefined,
        ...(get(props, "styles") as object),
      }}
    >
      {renderedChildren}
    </AntRow>
  );
};

WidgetRegistry.register("Row", Row);
