import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { useEnsembleState } from "framework";
import { WidgetRegistry } from "../registry";
import type { BaseTextProps } from "../util/types";
import { getTextAlign } from "../util/utils";

// TODO: customize in theme
const components = {
  h1: ({ node, ...props }) => <h1 style={{ fontSize: "2.5em" }} {...props} />,
};

export const Markdown: React.FC<BaseTextProps> = (props) => {
  const [text, setText] = useState(props.text);
  const { values } = useEnsembleState({ ...props, text }, props.id, {
    setText,
  });
  return (
    <div style={{ textAlign: getTextAlign(props.textAlign) }}>
      <ReactMarkdown components={components}>{values.text ?? ""}</ReactMarkdown>
    </div>
  );
};

WidgetRegistry.register("Markdown", Markdown);
