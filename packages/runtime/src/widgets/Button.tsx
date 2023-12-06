import type { EnsembleAction, Expression } from "@ensembleui/react-framework";
import { useRegisterBindings } from "@ensembleui/react-framework";
import { Button as AntButton, Form as AntForm } from "antd";
import { useCallback, useMemo } from "react";
import { WidgetRegistry } from "../registry";
import type { EnsembleWidgetProps, IconProps } from "../shared/types";
import { useEnsembleAction } from "../runtime/hooks/useEnsembleAction";
import { Icon } from "./Icon";

export type ButtonProps = {
  label: Expression<string>;
  onTap?: EnsembleAction;
  submitForm?: boolean;
  startingIcon?: IconProps;
  endingIcon?: IconProps;
  styles?: {
    textColor: string;
    gap: string | number;
  };
} & EnsembleWidgetProps;

export const Button: React.FC<ButtonProps> = (props) => {
  const { values, rootRef } = useRegisterBindings(props, props.id);
  const action = useEnsembleAction(props.onTap);
  const onClickCallback = useCallback(() => {
    if (!action) {
      return;
    }
    action.callback();
  }, [action]);

  const ButtonComponent = useMemo(() => {
    return (
      <AntButton
        htmlType="submit"
        onClick={onClickCallback}
        ref={rootRef}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "auto",
          color: values?.styles?.textColor ?? "black",
          ...values?.styles,
        }}
      >
        {values?.startingIcon ? <Icon {...values.startingIcon} /> : null}
        &nbsp;
        {values?.label}
        {values?.endingIcon ? <Icon {...values.endingIcon} /> : null}
      </AntButton>
    );
  }, [onClickCallback, rootRef, values]);

  if (values?.submitForm) {
    return (
      <AntForm.Item
        style={{
          margin: "0px",
        }}
      >
        {ButtonComponent}
      </AntForm.Item>
    );
  }
  return ButtonComponent;
};

WidgetRegistry.register("Button", Button);
