import { Input, Form } from "antd";
import type { Expression } from "@ensembleui/react-framework";
import { useRegisterBindings } from "@ensembleui/react-framework";
import type { ChangeEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { debounce } from "lodash-es";
import type { EnsembleWidgetProps } from "../../shared/types";
import { WidgetRegistry } from "../../registry";
import type { TextStyles } from "../Text";
import type { FormInputProps } from "./types";
import { EnsembleFormItem } from "./FormItem";

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
    { ...props, initialValue: props.value, value },
    props.id,
    {
      setValue,
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

  const changeHandler = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => setValue(event.target.value);

  // We need to debounce the change handler otherwise state updates will create too many re-renders
  const debouncedChangeHandler = useMemo(
    () => debounce(changeHandler, 300),
    [],
  );

  return (
    <EnsembleFormItem valuePropName="value" values={values}>
      {values?.multiLine ? (
        <Input.TextArea
          defaultValue={values.value}
          onChange={debouncedChangeHandler}
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
          onChange={debouncedChangeHandler}
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

WidgetRegistry.register("TextInput", TextInput);
