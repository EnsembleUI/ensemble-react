import React, { useEffect, useState } from "react";
import type { Expression } from "framework";
import { useRegisterBindings, useScreenContext } from "framework";
import { WidgetRegistry } from "../registry";
import { getColor } from "../util/utils";
import type { EnsembleWidgetProps, HasBorder } from "../util/types";
import {
  evaluate,
  isExpression,
} from "framework";
export type ImageProps = {
  source: Expression<string>;

  // move these under styles
  padding: string;
  backgroundColor: string;
  width?: number | string;
  height?: number | string;
  fit?: "contain" | "cover" | "fill" | "none" | "scale-down";
} & HasBorder &
  EnsembleWidgetProps;

export const Image: React.FC<ImageProps> = (props) => {
  const [source, setSource] = useState(props.source);
  const { values } = useRegisterBindings({ ...props, source }, props.id, {
    setSource,
  });
  const [imageBackgroundColor, setImageBackgroundColor] = useState(props.backgroundColor);
  const bgColor = useRegisterBindings(
    { ...props, imageBackgroundColor },
    props.id,
    {
      setImageBackgroundColor,
    }
  );

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
        backgroundColor: bgColor.values.imageBackgroundColor,
        padding: props.padding,
      }}
    />
  );
};

WidgetRegistry.register("Image", Image);
