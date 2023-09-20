import type { Expression } from "framework";
import { Button as AntButton } from "antd";
import { useEnsembleState, useEvaluate } from "framework";
import { WidgetRegistry } from "../registry";
import type { EnsembleWidgetProps, IconProps } from "../util/types";
import { useNavigateScreen } from "../runtime/navigate";
import { Icon } from "./Icon";

export type ButtonProps = {
  label: Expression<string>;
  onTap?: {
    executeCode?: string;
    navigateScreen?: string;
  };
  startingIcon?: IconProps;
  endingIcon?: IconProps;
  gap?: number | string;
  backgroundColor?: number | string;
  padding?: number | string;
} & EnsembleWidgetProps;

export const Button: React.FC<ButtonProps> = (props) => {
  const onTap = props.onTap?.executeCode;
  const { values } = useEnsembleState(props, props.id);
  const onTapCallback = useEvaluate(onTap, values);
  const onNavigate = useNavigateScreen(props.onTap?.navigateScreen);

  return (
    <AntButton
      onClick={onTap ? onTapCallback : onNavigate}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "auto",
        backgroundColor: String(props.styles?.backgroundColor),
        padding: props.styles?.padding,
      }}
      type="primary"
    >
      {props.startingIcon ? <Icon {...props.startingIcon} /> : null}
      {values.label}
      {props.endingIcon ? <Icon {...props.endingIcon} /> : null}
    </AntButton>
  );
};

WidgetRegistry.register("Button", Button);
