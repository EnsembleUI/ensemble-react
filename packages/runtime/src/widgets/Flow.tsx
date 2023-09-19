import React, { useMemo } from "react";
import { WidgetRegistry } from "../registry";
import type { EnsembleWidgetProps, FlexboxProps } from "../util/types";
import { EnsembleRuntime } from "../runtime";
import { Space } from "antd";

export const Flow: React.FC<FlexboxProps> = (props) => {

  const renderedChildren = useMemo(() => {
    return EnsembleRuntime.render(props.children);
  }, [props.children]);

  return (<Space wrap>
    {renderedChildren}
  </Space>)
};

WidgetRegistry.register("Flow", Flow);
