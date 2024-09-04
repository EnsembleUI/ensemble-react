import {
  useRegisterBindings,
  type EnsembleAction,
  type EnsembleWidget,
} from "@ensembleui/react-framework";
import { Form as AntForm } from "antd";
import type { FormProps as AntFormProps } from "antd";
import { useCallback, useState } from "react";
import type { FormLayout } from "antd/es/form/Form";
import { set } from "lodash-es";
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
  enabled?: boolean;
  onSubmit?: EnsembleAction;
  onChange?: EnsembleAction;
  styles?: {
    labelPosition: "top" | "start" | "none";
    labelOverflow: "wrap" | "visible" | "clip" | "ellipsis";
  } & EnsembleWidgetStyles;
} & EnsembleWidgetProps;

type AntFieldData = NonNullable<AntFormProps["fields"]>;

export const Form: React.FC<FormProps> = (props) => {
  const { children, ...rest } = props;

  const [form] = AntForm.useForm<unknown>();
  const getValues = form.getFieldsValue;

  const action = useEnsembleAction(props.onSubmit);
  const onChangeAction = useEnsembleAction(props.onChange);

  const onFinishCallback = useCallback(
    (vals: unknown) => {
      if (!action) {
        return;
      }

      return action.callback({ vals });
    },
    [action],
  );

  const onChangeActionCallback = useCallback(
    (changedFields: AntFieldData) => {
      const fields = {};

      changedFields.map(({ name, value }) =>
        set(fields, name as string[], value),
      );

      onChangeAction?.callback({ fields });
    },
    [onChangeAction],
  );

  // reset form
  const handleResetForm = useCallback(() => {
    form.resetFields();
  }, [form]);

  // clear form
  const handleClearForm = useCallback(() => {
    const fields = form.getFieldsValue() as { [key: string]: unknown };
    Object.keys(fields).forEach((field) => {
      form.setFieldValue(field, null);
    });
  }, [form]);

  const [isValid, setIsValid] = useState(false);
  const validate = useCallback<typeof form.validateFields>(
    async (...options) => {
      try {
        const result = await form.validateFields(options);
        setIsValid(true);
        return result;
      } catch (e) {
        setIsValid(false);
        return e;
      }
    },
    [form],
  );

  const { values } = useRegisterBindings(
    { ...rest, isValid },
    rest.id,
    {
      getValues,
      reset: handleResetForm,
      clear: handleClearForm,
      submit: form.submit,
      updateValues: form.setFieldsValue,
      validate,
    },
    { forceState: true },
  );

  return (
    <AntForm
      colon={false}
      form={form}
      layout={getLayout(values?.styles?.labelPosition)}
      onFieldsChange={onChangeActionCallback}
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
