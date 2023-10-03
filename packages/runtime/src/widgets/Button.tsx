import type { Expression } from "framework";
import {
  useRegisterBindings,
  useExecuteCode,
  NavigateModalScreenProps,
} from "framework";
import { useNavigateScreen } from "../runtime/navigate";
import useNavigateModalScreen from "../runtime/navigateModal";
import { WidgetRegistry } from "../registry";
import type { EnsembleWidgetProps } from "../util/types";
import { Button as AntButton } from "antd";

export type ButtonProps = {
  label: Expression<string>;
  onTap?: {
    executeCode?: string;
    navigateScreen?: string;
    navigateModalScreen?: string | NavigateModalScreenProps;
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
        type="primary"
      >
        {values.label}
      </AntButton>
      {renderModal}
    </>
  );
};

WidgetRegistry.register("Button", Button);
