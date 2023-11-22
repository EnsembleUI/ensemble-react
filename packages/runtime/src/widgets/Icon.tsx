import React, { useState } from "react";
import { useRegisterBindings } from "@ensembleui/react-framework";
import { WidgetRegistry } from "../registry";
import type { IconProps } from "../shared/types";
import { getColor, getIcon } from "../shared/styles";

export const Icon: React.FC<IconProps> = (props) => {
  const [color, setColor] = useState(props.color);
  const [name, setName] = useState(props.name);
  const [backgroundColor, setBackgroundColor] = useState(
    props.styles?.backgroundColor,
  );
  const { values } = useRegisterBindings(
    { ...props, color, name, backgroundColor },
    props.id,
    {
      setColor,
      setName,
      setBackgroundColor,
    },
  );
  const IconComponent = getIcon(values?.name ? values.name : "");
  if (IconComponent) {
    return (
      <IconComponent
        sx={{
          color: props.color && getColor(String(values?.color)),
          fontSize: props.size,
          backgroundColor: `${
            props.styles?.backgroundColor
              ? props.styles.backgroundColor
              : "transparent"
          }`,
          padding: `${
            props.styles?.padding ? `${props.styles.padding}px` : "0px"
          }`,
          margin: `${
            props.styles?.margin ? `${props.styles.margin}px` : "0px"
          }`,
          borderRadius: `${
            props.styles?.borderRadius
              ? `${props.styles.borderRadius}px`
              : "0px"
          }`,
          borderWidth: `${
            props.styles?.borderWidth ? `${props.styles.borderWidth}px` : "0px"
          }`,
          borderColor: props.styles?.borderColor
            ? getColor(props.styles.borderColor)
            : undefined,
          borderStyle: props.styles?.borderWidth ? "solid" : undefined,
        }}
      />
    );
  }
  return null;
};

WidgetRegistry.register("Icon", Icon);
