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
        justifyContent: props.styles?.mainAxis && getMainAxis(props.styles?.mainAxis),
        alignItems: props.styles?.crossAxis && getCrossAxis(props.styles?.crossAxis),
        margin: props.styles?.margin,
        padding: props.styles?.padding,
        gap: props.styles?.gap,
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
