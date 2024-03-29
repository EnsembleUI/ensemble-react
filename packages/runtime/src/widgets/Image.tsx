import React, { useCallback, useState } from "react";
import type { EnsembleAction, Expression } from "@ensembleui/react-framework";
import { useRegisterBindings } from "@ensembleui/react-framework";
import { WidgetRegistry } from "../registry";
import { getColor } from "../shared/styles";
import type { EnsembleWidgetProps } from "../shared/types";
import type { HasBorder } from "../shared/hasSchema";
import { useEnsembleAction } from "../runtime/hooks";

export type ImageProps = {
  source: Expression<string>;

  // move these under styles
  padding: string;
  backgroundColor: string;
  width?: number | string;
  height?: number | string;
  fit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  onDrag?: EnsembleAction;
} & HasBorder &
  EnsembleWidgetProps;

export const Image: React.FC<ImageProps> = ({ onDrag, ...props }) => {
  const [source, setSource] = useState(props.source);
  const [imageBackgroundColor, setImageBackgroundColor] = useState(
    props.backgroundColor,
  );
  const onDragAction = useEnsembleAction(onDrag);

  const onDragCallback = useCallback(
    (...args: unknown[]) => {
      if (!onDragAction?.callback) {
        return;
      }

      return onDragAction.callback(...args);
    },
    [onDragAction],
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
      className={values?.styles?.names}
      onDrag={onDragCallback}
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

WidgetRegistry.register("Image", Image);
