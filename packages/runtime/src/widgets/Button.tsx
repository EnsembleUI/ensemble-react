import type { Expression } from "framework";
import { Button as AntButton } from "antd";
import { useEnsembleState, useEvaluate } from "framework";
import { WidgetRegistry } from "../registry";
import { EnsembleWidgetProps } from "../util/types";

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
    <AntButton onClick={onTapCallback} type="primary">
      {values.label}
    </AntButton>
  );
};

WidgetRegistry.register("Button", Button);
