import { useMemo } from "react";
import { Col } from "antd";
import { get } from "lodash-es";
import { useRegisterBindings } from "@ensembleui/react-framework";
import { WidgetRegistry } from "../registry";
import { EnsembleRuntime } from "../runtime";
import type { FlexboxProps } from "../shared/types";
import { getColor, getCrossAxis, getMainAxis } from "../shared/styles";

export const Column: React.FC<FlexboxProps> = (props) => {
  const renderedChildren = useMemo(() => {
    return EnsembleRuntime.render(props.children);
  }, [props.children]);
  const { values, rootRef } = useRegisterBindings({ ...props }, props.id);
  return (
    <Col
      className={values?.styles?.names}
      ref={rootRef}
      style={{
        ...values?.styles,
        flexDirection: "column",
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

        display: "flex",
        ...(get(props, "styles") as object),
      }}
    >
      {renderedChildren}
    </Col>
  );
};

WidgetRegistry.register("Column", Column);
