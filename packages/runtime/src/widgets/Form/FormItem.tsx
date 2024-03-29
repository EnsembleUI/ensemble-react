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
  const { values, ...rest } = props;
  const { backgroundColor: _, ...formItemStyles } = values?.styles ?? {};
  const formInstance = AntForm.useFormInstance();

  return (
    <AntForm.Item
      className={values?.styles?.names}
      id={values?.id ?? values?.label}
      initialValue={values?.value}
      label={
        values?.label ? (
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
        ) : null
      }
      name={formInstance ? values?.id ?? values?.label : undefined}
      rules={[{ required: Boolean(values?.required) }]}
      style={{
        margin: "0px",
        ...(values?.styles?.visible === false
          ? { display: "none" }
          : undefined),
        ...formItemStyles,
      }}
      {...rest}
    >
      {props.children}
    </AntForm.Item>
  );
};
