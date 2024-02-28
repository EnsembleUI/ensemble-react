import React, { useState } from "react";
import { useRegisterBindings } from "@ensembleui/react-framework";
import { WidgetRegistry } from "../registry";
import type { IconProps } from "../shared/types";
import { getColor, getIcon } from "../shared/styles";
import { useEnsembleAction } from "../runtime/hooks/useEnsembleAction";

export const Icon: React.FC<IconProps> = ({ onTap, onHover, ...props }) => {
  const [color, setColor] = useState(props.color);
  const [name, setName] = useState(props.name);
  const [backgroundColor, setBackgroundColor] = useState(
    props.styles?.backgroundColor,
  );
  const onTapActionCallback = useEnsembleAction(onTap);
  const onHoverActionCallback = useEnsembleAction(onHover);

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
  if (!IconComponent) {
    return null;
  }
  return (
    <IconComponent
      className={values?.styles?.names}
      onClick={(): unknown => onTapActionCallback?.callback()}
      onMouseEnter={(): unknown => onHoverActionCallback?.callback()}
      sx={{
        ...values?.styles,
        color: values?.color && getColor(String(values.color)),
        fontSize: props.size,
        backgroundColor: `${
          values?.styles?.backgroundColor
            ? values.styles.backgroundColor
            : "transparent"
        }`,
        padding: `${
          values?.styles?.padding ? `${values.styles.padding}px` : "0px"
        }`,
        margin: `${
          values?.styles?.margin ? `${values.styles.margin}px` : "0px"
        }`,
        borderRadius: `${
          values?.styles?.borderRadius
            ? `${values.styles.borderRadius}px`
            : "0px"
        }`,
        borderWidth: `${
          values?.styles?.borderWidth ? `${values.styles.borderWidth}px` : "0px"
        }`,
        borderColor: values?.styles?.borderColor
          ? getColor(String(values.styles.borderColor))
          : undefined,
        borderStyle: values?.styles?.borderWidth ? "solid" : undefined,
        cursor: onTap ? "pointer" : "auto",
        ...(values?.styles?.visible === false
          ? { display: "none" }
          : undefined),
      }}
    />
  );
};

WidgetRegistry.register("Icon", Icon);
