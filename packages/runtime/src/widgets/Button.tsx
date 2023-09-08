import type { Expression } from "framework";
import { useEnsembleState, useEvaluate } from "framework";
import { WidgetRegistry } from "../registry";
import type { EnsembleWidgetProps } from ".";

export type ButtonProps = {
  label: Expression<string>;
  onTap?: {
    executeCode: string;
  };
} & EnsembleWidgetProps;

export const Button: React.FC<ButtonProps> = (props) => {
  const onTap = props.onTap?.executeCode;
  const { values } = useEnsembleState(props, props.id);
  const onTapCallback = useEvaluate(onTap, values);
  return (
    <button onClick={onTapCallback} type="button">
      {values.label}
    </button>
  );
};

WidgetRegistry.register("Button", Button);
