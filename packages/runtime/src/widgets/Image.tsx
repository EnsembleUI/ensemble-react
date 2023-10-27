import React, { useState } from "react";
import type { Expression } from "@ensembleui/react-framework";
import { useRegisterBindings } from "@ensembleui/react-framework";
import { WidgetRegistry } from "../registry";
import { getColor } from "../util/utils";
import type { EnsembleWidgetProps, HasBorder } from "../util/types";

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
  const [imageBackgroundColor, setImageBackgroundColor] = useState(
    props.backgroundColor,
  );
  const { values } = useRegisterBindings(
    { ...props, source, imageBackgroundColor },
    props.id,
    {
      setImageBackgroundColor,
      setSource,
    },
  );
  return (
    <img
      alt=""
      src={values?.source}
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
        backgroundColor: values?.imageBackgroundColor,
        padding: props.padding,
      }}
    />
  );
};

WidgetRegistry.register("Image", Image);
