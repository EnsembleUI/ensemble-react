import React, {useState} from "react";
import { WidgetRegistry } from "../registry";
import { getColor } from "../util/utils";
import type { EnsembleWidgetProps } from "../util/types";
import {Expression, useEnsembleState} from "framework";

export type ImageProps = {
  source: Expression<string>;

  // move these under styles
  width?: number | string;
  height?: number | string;
  fit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: number | string;
} & EnsembleWidgetProps;

export const Image: React.FC<ImageProps> = (props) => {
  const [source, setSource] = useState(props.source);
  const { values } = useEnsembleState({ ...props, source }, props.id, {
    setSource,
  });

  return (
    <img
      alt=""
      src={values.source}
      style={{
        width: props.width,
        height: props.height,
        objectFit: props.fit,
        borderRadius: props.borderRadius,
        borderWidth: props.borderWidth,
        borderColor: props.borderColor
          ? getColor(props.borderColor)
          : undefined,
        borderStyle: props.borderWidth ? "solid" : undefined,
      }}
    />
  );
};

WidgetRegistry.register("Image", Image);
