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
import { merge } from "lodash-es";

export interface TagStyles extends EnsembleWidgetStyles {
  backgroundColor?: Expression<string>;
  borderRadius?: string;
  fontSize?: Expression<string>;
  textColor?: Expression<string>;
  fontWeight?: Expression<string>;
  fontFamily: Expression<string>;
  textAlign:
    | "start"
    | "end"
    | "left"
    | "right"
    | "center"
    | "justify"
    | "match-parent";
  visible?: boolean;
}
export interface TagProps extends EnsembleWidgetProps<TagStyles> {
  label: Expression<string> | Expression<string[]>;
  icon?: IconProps;
}

export const Tag: React.FC<TagProps> = (props) => {
  const [label, setLabel] = useState(props.label);
  const [backgroundColor, setBackgroundColor] = useState(
    props.styles?.backgroundColor,
  );
  const [textColor, setTextColor] = useState(props.styles?.textColor);
  const { values, rootRef } = useRegisterBindings(
    { ...props, label, backgroundColor, textColor },
    props.id,
    {
      setLabel,
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
  const defaultStyles = {
    backgroundColor: "#e6e7e8",
    textAlign: "center",
    paddingLeft: "10px",
    paddingRight: "10px",
    display: "inline-flex",
    alignItems: "center",
    whiteSpace: "nowrap",
    borderRadius: 10,
    fontSize: 12,
    margin: "5px",
    fontWeight: "normal",
    cursor: "pointer",
  };
  const tagStyles = merge(defaultStyles, values?.styles);
  const truncatedLabels = expanded ? labels : labels.slice(0, 4);
  const additionalTagsCount = labels.length - truncatedLabels.length;
  const tagElements = truncatedLabels.map((item, index) => (
    <Typography.Text
      className={values?.styles?.names}
      key={index}
      style={{
        ...tagStyles,
        color: values?.textColor,
        ...(values?.styles?.visible === false
          ? { display: "none" }
          : undefined),
      }}
    >
      {item}
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
          style={{ ...tagStyles, color: values?.textColor }}
        >
          +{additionalTagsCount} more
        </Typography.Text>
      )}
    </div>
  );
};

WidgetRegistry.register("Tag", Tag);
