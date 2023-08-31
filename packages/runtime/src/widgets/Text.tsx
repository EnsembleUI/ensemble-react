import { useEnsembleState } from "framework";
import { WidgetRegistry } from "../registry";
import type { EnsembleWidgetProps } from ".";

// FIXME: refactor common props into re-usable interface
export type TextProps = {
  text: string;
  key?: string | number;
  [key: string]: unknown;
} & EnsembleWidgetProps;

export const Text: React.FC<TextProps> = (props) => {
  const { id, key } = props;
  const bindings = useEnsembleState<TextProps>({ id: String(id) }, props);
  return <span key={key}>{bindings?.text}</span>;
};

WidgetRegistry.register("Text", Text);
