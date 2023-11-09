import { useRegisterBindings } from "@ensembleui/react-framework";
import { useState } from "react";
import { Typography } from "antd";
import { WidgetRegistry } from "../registry";
import type { BaseTextProps } from "../shared/types";
import { getTextAlign } from "../shared/styles";

export interface TextStyles {
  fontSize?: string | number;
  fontWeight?: string | number;
  color: string;
  fontFamily: string;
  backgroundColor: string;
}

export type TextProps = {
  styles?: TextStyles;
} & BaseTextProps;

export const Text: React.FC<TextProps> = (props) => {
  const [text, setText] = useState(props.text);
  const { values } = useRegisterBindings({ ...props, text }, props.id, {
    setText,
  });
  return (
    <Typography.Text
      style={{
        textAlign: getTextAlign(props.textAlign),
        fontSize: props.styles?.fontSize,
        fontWeight: props.styles?.fontWeight,
        color: props.styles?.color,
        fontFamily: props.styles?.fontFamily,
        backgroundColor: props.styles?.backgroundColor,
        padding: props.styles?.padding,
        borderRadius: props.styles?.borderRadius,
      }}
    >
      {values?.text}
    </Typography.Text>
  );
};

WidgetRegistry.register("Text", Text);
