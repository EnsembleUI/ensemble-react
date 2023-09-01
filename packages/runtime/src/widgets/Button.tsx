import { useEnsembleState } from "framework";
import { WidgetRegistry } from "../registry";
import { useWidgetId } from "../runtime";
import type { EnsembleWidgetProps } from ".";

export type ButtonProps = {
  label: string;
} & EnsembleWidgetProps;

export const Button: React.FC<ButtonProps> = (props) => {
  const { id } = props;
  const resolvedWidgetId = useWidgetId(id);
  const bindings = useEnsembleState({ id: resolvedWidgetId }, props);
  return <button type="button">{bindings?.label}</button>;
};

WidgetRegistry.register("Button", Button);
