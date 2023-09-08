import type { Expression } from "framework";
import { useEnsembleState } from "framework";
import { useState } from "react";
import { WidgetRegistry } from "../registry";
import type { EnsembleWidgetProps } from ".";

export type TextProps = {
  text: Expression<string>;
  [key: string]: unknown;
} & EnsembleWidgetProps;

export const Text: React.FC<TextProps> = (props) => {
  const [text, setText] = useState(props.text);
  const { values } = useEnsembleState({ ...props, text }, props.id, {
    setText,
  });
  return <span>{values.text}</span>;
};

WidgetRegistry.register("Text", Text);
