import { useEnsembleState } from "framework";
import { WidgetRegistry } from "../registry";

// FIXME: refactor common props into re-usable interface
export interface TextProps {
  text: string;
  key?: string | number;
  [key: string]: unknown;
}

export const Text: React.FC<TextProps> = (props) => {
  const { key } = props;
  const bindings = useEnsembleState<TextProps>(
    { id: String(key), methods: {} },
    props,
  );
  return <span key={key}>{bindings?.text}</span>;
};

WidgetRegistry.register("Text", Text);
