import {
  useRegisterBindings,
  type Expression,
} from "@ensembleui/react-framework";
import { useState } from "react";
import { Typography } from "antd";
import { toString } from "lodash-es";
import { WidgetRegistry } from "../registry";
import type { BaseTextProps } from "../shared/types";
import type { TextAlignment } from "../shared/styleSchema";

const widgetName = "Text";

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
  const { values, rootRef } = useRegisterBindings(
    { ...props, text, widgetName },
    props.id,
    {
      setText,
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
      {`${toString(values?.text)}`}
    </Typography.Text>
  );
};

WidgetRegistry.register(widgetName, Text);
