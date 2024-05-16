import React, { useCallback, useState } from "react";
import type { EnsembleAction, Expression } from "@ensembleui/react-framework";
import { useRegisterBindings } from "@ensembleui/react-framework";
import { WidgetRegistry } from "../registry";
import { getColor } from "../shared/styles";
import type { EnsembleWidgetProps } from "../shared/types";
import type { HasBorder } from "../shared/hasSchema";
import { useEnsembleAction } from "../runtime/hooks";

const widgetName = "Image";

export type ImageProps = {
  source: Expression<string>;

  // move these under styles
  padding: string;
  backgroundColor: string;
  width?: number | string;
  height?: number | string;
  fit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  onDragStart?: EnsembleAction;
} & HasBorder &
  EnsembleWidgetProps;

export const Image: React.FC<ImageProps> = ({ onDragStart, ...props }) => {
  const [source, setSource] = useState(props.source);
  const [imageBackgroundColor, setImageBackgroundColor] = useState(
    props.backgroundColor,
  );
  const onDragStartAction = useEnsembleAction(onDragStart);

  const onDragStartCallback = useCallback(
    (...args: unknown[]) => {
      if (!onDragStartAction?.callback) {
        return;
      }

      return onDragStartAction.callback(...args);
    },
    [onDragStartAction],
  );

  const { values } = useRegisterBindings(
    { ...props, source, imageBackgroundColor, widgetName },
    props.id,
    {
      setImageBackgroundColor,
      setSource,
    },
  );
  return (
    <img
      alt=""
      className={values?.styles?.names}
      onDragStart={onDragStartCallback}
      src={values?.source}
      style={{
        ...values?.styles,
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
        ...(values?.styles?.visible === false
          ? { display: "none" }
          : undefined),
      }}
    />
  );
};

WidgetRegistry.register(widgetName, Image);
