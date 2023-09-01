import { useEnsembleState } from "framework";
import { WidgetRegistry } from "../registry";
import { useWidgetId } from "../runtime";
import type { EnsembleWidgetProps } from ".";

// FIXME: refactor common props into re-usable interface
export type TextProps = {
  text: string;
  key?: string | number;
  [key: string]: unknown;
} & EnsembleWidgetProps;

export const Text: React.FC<TextProps> = (props) => {
  const { id } = props;
  const resolvedWidgetId = useWidgetId(id);
  const bindings = useEnsembleState<TextProps>({ id: resolvedWidgetId }, props);
  return <span>{bindings?.text}</span>;
};

WidgetRegistry.register("Text", Text);
