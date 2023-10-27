import React, { useState } from "react";
import { useRegisterBindings } from "@ensembleui/react-framework";
import { WidgetRegistry } from "../registry";
import type { IconProps } from "../util/types";
import { getColor, getIcon } from "../util/utils";

export const Icon: React.FC<IconProps> = (props) => {
  const [color, setColor] = useState(props.color);
  const [name, setName] = useState(props.name);
  const { values } = useRegisterBindings({ ...props, color, name }, props.id, {
    setColor,
    setName,
  });
  const IconComponent = getIcon(values?.name ?? name);
  if (IconComponent) {
    return (
      <IconComponent
        sx={{
          color: props.color && getColor(String(values?.color)),
          fontSize: props.size,
        }}
      />
    );
  }
  return null;
};

WidgetRegistry.register("Icon", Icon);
