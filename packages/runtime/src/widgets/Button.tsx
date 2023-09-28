import type { Expression } from "framework";
import { Button as AntButton } from "antd";
import { useRegisterBindings, useExecuteCode } from "framework";
import { WidgetRegistry } from "../registry";
import type { EnsembleWidgetProps } from "../util/types";
import { useNavigateScreen } from "../runtime/navigate";

export type ButtonProps = {
  label: Expression<string>;
  onTap?: {
    executeCode?: string;
    navigateScreen?: string;
  };
} & EnsembleWidgetProps;

export const Button: React.FC<ButtonProps> = (props) => {
  const onTap = props.onTap?.executeCode;
  const { values } = useRegisterBindings(props, props.id);
  const onTapCallback = useExecuteCode(onTap, values);
  const onNavigate = useNavigateScreen(props.onTap?.navigateScreen);
  return (
    <AntButton onClick={onTap ? onTapCallback : onNavigate} type="primary">
      {values.label}
    </AntButton>
  );
};

WidgetRegistry.register("Button", Button);
