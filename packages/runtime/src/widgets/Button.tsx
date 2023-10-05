import type { EnsembleAction, Expression } from "framework";
import { useRegisterBindings } from "framework";
import { Button as AntButton } from "antd";
import { useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { noop } from "chart.js/dist/helpers/helpers.core";
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
  const methods = useFormContext();

  const onClickCallback = useCallback(() => {
    if (values.submitForm) {
      const submit = methods.handleSubmit(noop);
      void submit();
    }

    if (!action) {
      return;
    }
    action.callback();
  }, [action, methods, values.submitForm]);
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
