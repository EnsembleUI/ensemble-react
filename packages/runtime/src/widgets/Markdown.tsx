import type { ReactElement } from "react";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { useRegisterBindings } from "@ensembleui/react-framework";
import { WidgetRegistry } from "../registry";
import type { BaseTextProps } from "../shared/types";
import { getTextAlign } from "../shared/styles";

export type MarkdownProps = {
  // to be added more
} & BaseTextProps;
// TODO: customize in theme
const components = {
  h1: ({ ...props }): ReactElement => (
    // eslint-disable-next-line jsx-a11y/heading-has-content
    <h1 style={{ fontSize: "2.5em" }} {...props} />
  ),
};

export const Markdown: React.FC<MarkdownProps> = (props) => {
  const [text, setText] = useState(props.text);
  if (props.text !== text) {
    setText(props.text);
  }
  const { values } = useRegisterBindings({ ...props, text }, props.id, {
    setText,
  });
  return (
    <div
      className={values?.styles?.names}
      style={{ ...values?.styles, textAlign: getTextAlign(props.textAlign) }}
    >
      <ReactMarkdown components={components}>
        {values?.text ?? ""}
      </ReactMarkdown>
    </div>
  );
};

WidgetRegistry.register("Markdown", Markdown);
