import type { Expression } from "framework";
import {
  useRegisterBindings,
  useExecuteCode,
  NavigateModalScreenProps,
} from "framework";
import { useNavigateScreen } from "../runtime/navigate";
import useNavigateModalScreen from "../runtime/navigateModal";
import { WidgetRegistry } from "../registry";
import type { EnsembleWidgetProps, IconProps } from "../util/types";
import { Button as AntButton } from "antd";
import { Icon } from "./Icon";

export type ButtonProps = {
  label: Expression<string>;
  onTap?: {
    executeCode?: string;
    navigateScreen?: string;
    navigateModalScreen?: string | NavigateModalScreenProps;
  };
  startingIcon?: IconProps;
  endingIcon?: IconProps;
  styles?: {
    textColor: string;
    borderColor: string;
    borderRadius: string;
    borderWidth: string;
    gap?: number | string;
    backgroundColor?: number | string;
    padding?: number | string;
  };
} & EnsembleWidgetProps;

export const Button: React.FC<ButtonProps> = (props) => {
  const onTap = props?.onTap?.executeCode;
  const { values } = useRegisterBindings(props, props?.id);
  const onTapCallback = useExecuteCode(onTap, values);
  const onNavigate = useNavigateScreen(props?.onTap?.navigateScreen);
  const { openModal, renderModal } = useNavigateModalScreen(
    props?.onTap?.navigateModalScreen
  );

  return (
    <>
      <AntButton
        onClick={
          props?.onTap?.navigateScreen
            ? onNavigate
            : props?.onTap?.navigateModalScreen
            ? openModal
            : onTapCallback
        }
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "auto",
          backgroundColor: String(props.styles?.backgroundColor),
          padding: props.styles?.padding,
          color: props.styles?.textColor ?? "black",
          borderColor: props.styles?.borderColor,
          borderWidth: props.styles?.borderWidth,
          borderRadius: props.styles?.borderRadius,
        }}
      >
        {props.startingIcon ? <Icon {...props.startingIcon} /> : null}
        &nbsp;
        {values.label}
        {props.endingIcon ? <Icon {...props.endingIcon} /> : null}
      </AntButton>
      {renderModal}
    </>
  );
};

WidgetRegistry.register("Button", Button);
