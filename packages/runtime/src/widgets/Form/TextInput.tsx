import { Form as AntForm, Input } from "antd";
import { useRegisterBindings } from "framework";
import { useState } from "react";
import type { EnsembleWidgetProps } from "../../util/types";
import { WidgetRegistry } from "../../registry";
import type { FormInputProps } from "./types";

export type TextInputProps = EnsembleWidgetProps & FormInputProps<string>;
export const TextInput: React.FC<TextInputProps> = (props) => {
  const [value, setValue] = useState(props.value);
  const { values } = useRegisterBindings({ ...props, value }, props.id, {
    setValue,
  });

  return (
    <AntForm.Item
      label={values.label}
      name={values.label}
      rules={[{ required: values.required }]}
      style={{
        margin: "0px",
      }}
    >
      <Input
        onChange={(event): void => setValue(event.target.value)}
        placeholder={values?.hintText ? values.hintText : ""}
      />
    </AntForm.Item>
  );
};

WidgetRegistry.register("TextInput", TextInput);
