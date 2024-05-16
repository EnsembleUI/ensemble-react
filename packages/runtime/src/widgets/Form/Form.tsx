import {
  useRegisterBindings,
  type EnsembleAction,
  type EnsembleWidget,
} from "@ensembleui/react-framework";
import { Form as AntForm } from "antd";
import { useCallback } from "react";
import type { FormLayout } from "antd/es/form/Form";
import { WidgetRegistry } from "../../registry";
import { EnsembleRuntime } from "../../runtime";
import { useEnsembleAction } from "../../runtime/hooks/useEnsembleAction";
import type {
  EnsembleWidgetProps,
  EnsembleWidgetStyles,
} from "../../shared/types";

const widgetName = "Form";

export type FormProps = {
  children: EnsembleWidget[];
  enabled: boolean;
  onSubmit?: EnsembleAction;
  styles?: {
    labelPosition: "top" | "start" | "none";
    labelOverflow: "wrap" | "visible" | "clip" | "ellipsis";
  } & EnsembleWidgetStyles;
} & EnsembleWidgetProps;
export const Form: React.FC<FormProps> = (props) => {
  const { children, ...rest } = props;
  
  const [form] = AntForm.useForm();
  const getValues = form.getFieldsValue;
  
  const action = useEnsembleAction(props.onSubmit);
  const onFinishCallback = useCallback(
    (vals: unknown) => {
      if (!action) {
        return;
      }

      return action.callback({ vals });
    },
    [action],
  );

  const { values } = useRegisterBindings({ ...rest }, rest.id, { getValues });

  return (
    <AntForm
      form={form}
      colon={false}
      layout={getLayout(values?.styles?.labelPosition)}
      onFinish={onFinishCallback}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: `${values?.styles?.gap || "2px"}`,
        width: values?.styles?.width,
        ...values?.styles,
      }}
    >
      {EnsembleRuntime.render(children)}
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

WidgetRegistry.register(widgetName, Form);
