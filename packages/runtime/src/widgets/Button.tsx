import { useEnsembleState } from "framework";
import { WidgetRegistry } from "../registry";
import type { EnsembleWidgetProps } from ".";

export type ButtonProps = {
  label: string;
} & EnsembleWidgetProps;

export const Button: React.FC<ButtonProps> = (props) => {
  const { id } = props;
  const bindings = useEnsembleState({ id: String(id) }, props);
  return <button type="button">{bindings?.label}</button>;
};

WidgetRegistry.register("Button", Button);
