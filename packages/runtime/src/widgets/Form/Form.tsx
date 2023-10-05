import type { EnsembleAction, EnsembleWidget } from "framework";
import { Form as AntForm } from "antd";
import { useCallback } from "react";
import type { FormLayout } from "antd/es/form/Form";
import { WidgetRegistry } from "../../registry";
import { EnsembleRuntime } from "../../runtime";
import { useEnsembleAction } from "../../runtime/hooks/useEnsembleAction";

export interface FormProps {
  children: EnsembleWidget[];
  enabled: boolean;
  onSubmit?: EnsembleAction;
  styles: {
    labelPosition: "top" | "start" | "none";
    labelOverflow: "wrap" | "visible" | "clip" | "ellipsis";
  };
}
export const Form: React.FC<FormProps> = (props) => {
  const action = useEnsembleAction(props.onSubmit);

  const onFinishCallback = useCallback(
    (values: unknown) => {
      if (!action) {
        return;
      }

      return action.callback(values);
    },
    [action],
  );

  return (
    <AntForm
      colon={false}
      layout={getLayout(props.styles.labelPosition)}
      onFinish={onFinishCallback}
    >
      {EnsembleRuntime.render(props.children)}
    </AntForm>
  );
};

const getLayout = (labelPosition?: string): FormLayout => {
  switch (labelPosition) {
    case "start":
      return "horizontal";
    case "top":
      return "vertical";
    default:
      return "horizontal";
  }
};

WidgetRegistry.register("Form", Form);
