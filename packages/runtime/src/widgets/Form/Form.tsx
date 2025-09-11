import {
  useRegisterBindings,
  type EnsembleAction,
  type EnsembleWidget,
} from "@ensembleui/react-framework";
import { Form as AntForm } from "antd";
import type { FormProps as AntFormProps } from "antd";
import { useCallback, useState } from "react";
import type { FormInstance, FormLayout } from "antd/es/form/Form";
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
    labelPosition?: "top" | "start" | "none";
    labelOverflow?: "wrap" | "visible" | "clip" | "ellipsis";
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
      return action?.callback({ vals });
    },
    [action?.callback],
  );

  const onChangeActionCallback = useCallback(
    (changedFields: AntFieldData) => {
      const fields = {};

      changedFields.map(({ name, value }) =>
        set(fields, name as string[], value),
      );

      onChangeAction?.callback({ fields });
    },
    [onChangeAction?.callback],
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
        await form.validateFields(options.length ? options : undefined);
        setIsValid(true);
        return true;
      } catch (error) {
        setIsValid(false);
        return false;
      }
    },
    [form],
  );

  const { values } = useRegisterBindings({ ...rest, isValid }, rest.id, {
    getValues,
    reset: handleResetForm,
    clear: handleClearForm,
    submit: form.submit,
    updateValues: form.setFieldsValue,
    validate,
  });

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

/**
 * Programmatically update the value of a field and trigger Ant Design's `onFieldsChange`
 * (or Ensemble Form's `onChange` action).
 *
 * Normally, calling `form.setFieldValue` or `form.setFieldsValue` does not fire `onFieldsChange`.
 * This helper uses Ant Design's internal `dispatch` mechanism to register the update
 * as if it were user-driven, so that `onFieldsChange` fires consistently.
 *
 * This is especially useful for widgets that update values programmatically
 * (e.g. Dropdown with `allowCreateOptions`).
 *
 * Alternatively, one could use Ant Design's `Form.useWatch`, but this approach
 * is less performant for large forms.
 *
 * ⚠️ Relies on Ant Design's private API (`RC_FORM_INTERNAL_HOOKS`), which may change
 * in future versions.
 *
 * Reference: https://github.com/ant-design/ant-design/issues/23782#issuecomment-2114700558
 */
export function updateFieldValue<Values>(
  form: FormInstance<Values>,
  name: string,
  value: unknown,
): void {
  type InternalForm = FormInstance<Values> & {
    getInternalHooks: (hook: string) => {
      dispatch: (action: {
        type: string;
        namePath: string[];
        value: unknown;
      }) => void;
    };
  };

  (form as InternalForm).getInternalHooks("RC_FORM_INTERNAL_HOOKS").dispatch({
    type: "updateValue",
    namePath: [name],
    value,
  });
}
