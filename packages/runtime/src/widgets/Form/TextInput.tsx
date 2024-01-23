import { Form as AntForm, Input } from "antd";
import { useRegisterBindings } from "@ensembleui/react-framework";
import { useState } from "react";
import type { EnsembleWidgetProps } from "../../shared/types";
import { WidgetRegistry } from "../../registry";
import type { FormInputProps } from "./types";
import { TextStyles } from "../Text";

export type TextInputProps = {
  hintStyle?: TextStyles;
  labelStyle?: TextStyles;
} & EnsembleWidgetProps<TextStyles> &
  FormInputProps<string>;

export const TextInput: React.FC<TextInputProps> = (props) => {
  const [value, setValue] = useState(props.value);
  const { values } = useRegisterBindings({ ...props, value }, props.id, {
    setValue,
  });

  return (
    <AntForm.Item
      label={
        values?.label ? (
          <label
            htmlFor={props.id ? values?.id : values?.label}
            title={values?.label}
            style={{
              ...values?.labelStyle,
            }}
          >
            {values?.label}
          </label>
        ) : null
      }
      name={props.id ? values?.id : values?.label}
      rules={[{ required: values?.required }]}
      style={{
        margin: "0px",
        width: "100%",
      }}
    >
      {props.multiLine ? (
        <Input.TextArea
          onChange={(event): void => setValue(event.target.value)}
          placeholder={values?.hintText ? values.hintText : ""}
          rows={props.maxLines ? Number(props.maxLines) : 4} // Adjust the number of rows as needed
          style={{
            ...(values?.value ? values?.styles : values?.hintStyle),
          }}
        />
      ) : (
        <Input
          onChange={(event): void => setValue(event.target.value)}
          placeholder={values?.hintText ? values.hintText : ""}
          style={{
            ...(values?.value ? values?.styles : values?.hintStyle),
          }}
        />
      )}
    </AntForm.Item>
  );
};

WidgetRegistry.register("TextInput", TextInput);
