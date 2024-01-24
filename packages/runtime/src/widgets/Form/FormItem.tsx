import type { FormItemProps } from "antd";
import { Form as AntForm } from "antd";
import type { FormInputProps } from "./types";
import { isString } from "lodash-es";
import { EnsembleRuntime } from "../../runtime";
import { unwrapWidget } from "@ensembleui/react-framework";

export type EnsembleFormItemProps<T> = FormItemProps & {
  values?: FormInputProps<T>;
};

/**
 * Controlled Form Item component that provides common defaults for all form items
 */
export const EnsembleFormItem: React.FC<EnsembleFormItemProps<unknown>> = (
  props,
) => {
  const { values } = props;
  return (
    <AntForm.Item
      className={values?.styles?.names}
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
      name={values?.id ?? values?.label}
      rules={[{ required: Boolean(values?.required) }]}
      style={{
        margin: "0px",
        ...(values?.styles?.visible === false
          ? { display: "none" }
          : undefined),
        ...values?.styles,
      }}
      {...props}
    >
      {props.children}
    </AntForm.Item>
  );
};
