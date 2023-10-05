import type { EnsembleAction, Expression } from "framework";
import { useRegisterBindings } from "framework";
import { Button as AntButton, Form as AntForm } from "antd";
import { useCallback } from "react";
import { WidgetRegistry } from "../registry";
import type { EnsembleWidgetProps } from "../util/types";
import { useEnsembleAction } from "../runtime/hooks/useEnsembleAction";

export type ButtonProps = {
  label: Expression<string>;
  onTap?: EnsembleAction;
  submitForm?: boolean;
} & EnsembleWidgetProps;

export const Button: React.FC<ButtonProps> = (props) => {
  const { values } = useRegisterBindings(props, props.id);
  const action = useEnsembleAction(props.onTap);

  const onClickCallback = useCallback(() => {
    if (!action) {
      return;
    }
    action.callback();
  }, [action]);
  if (values.submitForm) {
    return (
      <AntForm.Item>
        <>
          <AntButton htmlType="submit" onClick={onClickCallback} type="primary">
            {values.label}
          </AntButton>
          {action && "Modal" in action ? action.Modal : null}
        </>
      </AntForm.Item>
    );
  }
  return (
    <>
      <AntButton onClick={onClickCallback} type="primary">
        {values.label}
      </AntButton>
      {action && "Modal" in action ? action.Modal : null}
    </>
  );
};

WidgetRegistry.register("Button", Button);
