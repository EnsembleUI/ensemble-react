import {
  useRegisterBindings,
  type Expression,
} from "@ensembleui/react-framework";
import { useState } from "react";
import { Typography } from "antd";
import { WidgetRegistry } from "../registry";
import type { BaseTextProps } from "../shared/types";
import { TextAlignment } from "../shared/styleSchema";

export interface TextStyles {
  fontSize?: string | number;
  fontWeight?: string | number;
  /** @uiType color */
  color?: Expression<string>;
  fontFamily?: string;
  /**  @uiType color */
  backgroundColor?: string;
  textAlign?: TextAlignment;
}

export type TextProps = {
  styles?: TextStyles;
} & BaseTextProps;

export const Text: React.FC<TextProps> = (props) => {
  const [text, setText] = useState(props.text);
  const [color, setColor] = useState(props.styles?.color);
  const { values, rootRef } = useRegisterBindings(
    { ...props, text, color },
    props.id,
    {
      setText,
      setColor,
    },
  );

  return (
    <Typography.Text
      className={values?.styles?.names}
      ref={rootRef}
      style={{
        ...(values?.styles?.visible === false
          ? { display: "none" }
          : undefined),
        ...values?.styles,
      }}
    >
      {values?.text}
    </Typography.Text>
  );
};

WidgetRegistry.register("Text", Text);
