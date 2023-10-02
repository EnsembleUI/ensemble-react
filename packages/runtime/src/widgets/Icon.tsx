import React from "react";
import { WidgetRegistry } from "../registry";
import type { IconProps } from "../util/types";
import { getColor, getIcon } from "../util/utils";

export const Icon: React.FC<IconProps> = (props) => {
  const IconComponent = getIcon(props.name);
  if (IconComponent) {
    return (
      <IconComponent
        sx={{
          color: props.color && getColor(props.color),
          fontSize: props.size,
        }}
      />
    );
  }
  return null;
};

WidgetRegistry.register("Icon", Icon);
