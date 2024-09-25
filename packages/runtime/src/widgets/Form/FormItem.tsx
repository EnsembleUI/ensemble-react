import { useMemo } from "react";
import type { FormItemProps } from "antd";
import { Form as AntForm } from "antd";
import { isString } from "lodash-es";
import { unwrapWidget } from "@ensembleui/react-framework";
import { EnsembleRuntime } from "../../runtime";
import type { FormInputProps } from "./types";

export type EnsembleFormItemProps<T> = FormItemProps & {
  values?: FormInputProps<T>;
};

/**
 * Controlled Form Item component that provides common defaults for all form items
 */
export const EnsembleFormItem: React.FC<EnsembleFormItemProps<unknown>> = (
  props,
) => {
  const { values, rules, ...rest } = props;
  const { backgroundColor: _, ...formItemStyles } = values?.styles ?? {};
  const formInstance = AntForm.useFormInstance();
  const requiredRule = { required: Boolean(values?.required) };

  const fieldLabel = useMemo(() => {
    if (!values?.label) {
      return null;
    }

    return (
      <label
        htmlFor={values.id ?? values.label}
        style={{
          ...values.labelStyle,
        }}
        title={values.label}
      >
        {isString(values.label)
          ? values.label
          : EnsembleRuntime.render([unwrapWidget(values.label)])}
      </label>
    );
  }, []);

  return (
    <AntForm.Item
      className={values?.styles?.names}
      initialValue={values?.initialValue}
      label={fieldLabel}
      messageVariables={{
        label: (isString(values?.label) ? values?.label : values?.id) || "",
      }}
      name={formInstance ? values?.id ?? values?.label : undefined}
      rules={[requiredRule, ...(rules || [])]}
      style={{
        margin: "0px",
        ...(values?.styles?.visible === false
          ? { display: "none" }
          : undefined),
        ...formItemStyles,
      }}
      validateFirst
      validateTrigger={
        values?.validateOnUserInteraction === true ? "onChange" : "onSubmit"
      }
      {...rest}
    >
      {props.children}
    </AntForm.Item>
  );
};
