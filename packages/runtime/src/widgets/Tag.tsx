import { Expression, useRegisterBindings } from "framework";
import { useState } from "react";
import { Typography } from "antd";
import { WidgetRegistry } from "../registry";
import type { IconProps } from "../util/types";
import { Icon } from "./Icon";

export type TagProps = {
  id?: string;
  label: Expression<string> | Expression<string[]>;
  styles?: {
    backgroundColor: string;
    borderRadius: string;
  };
  icon: IconProps;
};

export const Tag: React.FC<TagProps> = (props) => {
  const [text, setText] = useState(props.label);
  const { values } = useRegisterBindings({ ...props, text }, props.id, {
    setText,
  });
  const [expanded, setExpanded] = useState(false);
const toggleExpansion = () => {
  setExpanded(!expanded);
};

  const labels = Array.isArray(values.label)
    ? (values.label as string[])
    : [values.label as string];
const truncatedLabels = expanded ? labels : labels.slice(0, 4);
const additionalTagsCount = labels.length - truncatedLabels.length;
  const tagElements = truncatedLabels.map((item, index) => (
    <Typography.Text
      key={index}
      style={{
        backgroundColor: props.styles?.backgroundColor ?? "#e6e7e8",
        paddingLeft: "10px",
        paddingRight: "10px",
        textAlign: "left",
        borderRadius: props.styles?.borderRadius ?? 10,
        fontWeight: "normal",
        display: "inline-flex",
        alignItems: "center",
        margin: "5px",
        whiteSpace: "nowrap",
      }}
    >
      {item} &nbsp;
      {props.icon && <Icon {...props.icon} />}
    </Typography.Text>
  ));

  return (
    <div>
      {tagElements}
      {additionalTagsCount > 0 && (
        <Typography.Text
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
          onClick={toggleExpansion}
        >
          +{additionalTagsCount} more
        </Typography.Text>
      )}
    </div>
  );
};

WidgetRegistry.register("Tag", Tag);
