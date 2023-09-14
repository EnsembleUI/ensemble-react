import { useMemo } from "react";
import { Row as AntRow } from "antd";
import { WidgetRegistry } from "../registry";
import { EnsembleRuntime } from "../runtime";
import { getCrossAxis, getMainAxis } from "../util/utils";
import type { FlexboxProps } from "../util/types";

export const Row: React.FC<FlexboxProps> = (props) => {
  const renderedChildren = useMemo(() => {
    return EnsembleRuntime.render(props.children);
  }, [props.children]);
  return (
    <AntRow
      style={{
        justifyContent: props.mainAxis && getMainAxis(props.mainAxis),
        alignItems: props.crossAxis && getCrossAxis(props.crossAxis),
        margin: props.margin,
        padding: props.padding,
        gap: props.gap,
      }}
    >
      {renderedChildren}
    </AntRow>
  );
};

WidgetRegistry.register("Row", Row);
