import React from "react";
import { WidgetRegistry } from "../registry";
import { getColor } from "../util/utils";
import {EnsembleWidgetProps} from "../util/types";

export type ImageProps = {
  source: string;

  // move these under styles
  width?: number | string;
  height?: number | string;
  fit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: number | string;
} & EnsembleWidgetProps;

export const Image: React.FC<ImageProps> = (props) => {
  return (
    <img
      alt=""
      src={props.source}
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
