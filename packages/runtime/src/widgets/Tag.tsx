import type { Expression } from "@ensembleui/react-framework";
import { useRegisterBindings } from "@ensembleui/react-framework";
import { useState } from "react";
import { Typography } from "antd";
import { WidgetRegistry } from "../registry";
import type {
  EnsembleWidgetProps,
  EnsembleWidgetStyles,
  IconProps,
} from "../shared/types";
import { Icon } from "./Icon";

export interface TagStyles extends EnsembleWidgetStyles {
  backgroundColor?: Expression<string>;
  borderRadius?: string;
  fontSize?: string;
  textColor?: string;
  fontWeight?: number | string;
  fontFamily: string;
  textAlign:
    | "start"
    | "end"
    | "left"
    | "right"
    | "center"
    | "justify"
    | "match-parent";
}
export interface TagProps extends EnsembleWidgetProps<TagStyles> {
  label: Expression<string> | Expression<string[]>;
  icon?: IconProps;
}

export const Tag: React.FC<TagProps> = (props) => {
  const [text, setText] = useState(props.label);
  const [backgroundColor, setBackgroundColor] = useState(
    props.styles?.backgroundColor,
  );
  const [textColor, setTextColor] = useState(props.styles?.textColor);
  const { values, rootRef } = useRegisterBindings(
    { ...props, text, backgroundColor, textColor },
    props.id,
    {
      setText,
      setBackgroundColor,
      setTextColor,
    },
  );
  const [expanded, setExpanded] = useState(false);
  const toggleExpansion = (): void => {
    setExpanded(!expanded);
  };
  const labels =
    values?.label && Array.isArray(values.label)
      ? values.label
      : [values?.label];
  const truncatedLabels = expanded ? labels : labels.slice(0, 4);
  const additionalTagsCount = labels.length - truncatedLabels.length;
  const tagElements = truncatedLabels.map((item, index) => (
    <Typography.Text
      className={values?.styles?.names}
      key={index}
      style={{
        backgroundColor: values?.backgroundColor ?? "#e6e7e8",
        paddingLeft: "10px",
        paddingRight: "10px",
        textAlign: props.styles?.textAlign ? props.styles.textAlign : "center",
        color: values?.textColor,
        borderRadius: props.styles?.borderRadius ?? 10,
        fontWeight: props.styles?.fontWeight
          ? props.styles.fontWeight
          : "normal",
        fontFamily: props.styles?.fontFamily,
        fontSize: props.styles?.fontSize ?? 12,
        display: "inline-flex",
        alignItems: "center",
        margin: props.styles?.margin ?? "5px",
        whiteSpace: "nowrap",
      }}
    >
      {item} &nbsp;
      {props.icon ? <Icon {...props.icon} /> : null}
    </Typography.Text>
  ));

  return (
    <div
      ref={rootRef}
      style={{
        display: "flex",
      }}
    >
      {tagElements}
      {additionalTagsCount > 0 && (
        <Typography.Text
          onClick={toggleExpansion}
          style={{
            backgroundColor: props.styles?.backgroundColor ?? "#e6e7e8",
            paddingLeft: "10px",
            paddingRight: "10px",
            textAlign: "left",
            borderRadius: props.styles?.borderRadius ?? 10,
            fontWeight: "bold",
            display: "inline-flex",
            alignItems: "center",
            margin: "5px",
            whiteSpace: "nowrap",
            cursor: "pointer",
          }}
        >
          +{additionalTagsCount} more
        </Typography.Text>
      )}
    </div>
  );
};

WidgetRegistry.register("Tag", Tag);
