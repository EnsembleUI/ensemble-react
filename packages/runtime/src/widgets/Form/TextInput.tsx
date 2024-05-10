import { Input, Form } from "antd";
import type { Expression } from "@ensembleui/react-framework";
import { useRegisterBindings } from "@ensembleui/react-framework";
import { useEffect, useState } from "react";
import type { EnsembleWidgetProps } from "../../shared/types";
import { WidgetRegistry } from "../../registry";
import type { TextStyles } from "../Text";
import type { FormInputProps } from "./types";
import { EnsembleFormItem } from "./FormItem";

const widgetName = "TextInput";

export type TextInputProps = {
  hintStyle?: TextStyles;
  labelStyle?: TextStyles;
  multiLine?: Expression<boolean>;
  maxLines?: number;
} & EnsembleWidgetProps<TextStyles> &
  FormInputProps<string>;

export const TextInput: React.FC<TextInputProps> = (props) => {
  const [value, setValue] = useState<string>();
  const { values } = useRegisterBindings(
    { ...props, initialValue: props.value, value, widgetName },
    props.id,
    {
      setValue,
    },
    {
      debounceMs: 300,
    },
  );
  const formInstance = Form.useFormInstance();

  useEffect(() => {
    setValue(values?.initialValue);
  }, [values?.initialValue]);

  useEffect(() => {
    if (formInstance && (values?.id || values?.label)) {
      formInstance.setFieldsValue({
        [values.id ?? values.label]: value,
      });
    }
  }, [value, formInstance, values?.id, values?.label]);

  return (
    <EnsembleFormItem valuePropName="value" values={values}>
      {values?.multiLine ? (
        <Input.TextArea
          defaultValue={values.value}
          disabled={values?.enabled === false}
          onChange={(event): void => setValue(event.target.value)}
          placeholder={values.hintText ?? ""}
          rows={values.maxLines ? Number(values.maxLines) : 4} // Adjust the number of rows as needed
          style={{
            ...(values.styles ?? values.hintStyle),
            ...(values.styles?.visible === false
              ? { display: "none" }
              : undefined),
          }}
          value={values.value}
        />
      ) : (
        <Input
          defaultValue={values?.value}
          disabled={values?.enabled === false}
          onChange={(event): void => setValue(event.target.value)}
          placeholder={values?.hintText ?? ""}
          style={{
            ...(values?.styles ?? values?.hintStyle),
            ...(values?.styles?.visible === false
              ? { display: "none" }
              : undefined),
          }}
          value={value}
        />
      )}
    </EnsembleFormItem>
  );
};

WidgetRegistry.register(widgetName, TextInput);
