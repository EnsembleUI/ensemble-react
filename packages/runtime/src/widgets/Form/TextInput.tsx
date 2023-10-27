import { Form as AntForm, Input } from "antd";
import { useRegisterBindings } from "@ensembleui/react-framework";
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
      label={values?.label}
      name={props.id ? values?.id : values?.label}
      rules={[{ required: values?.required }]}
      style={{
        margin: "0px",
      }}
    >
      {props.multiLine ? (
        <Input.TextArea
          onChange={(event): void => setValue(event.target.value)}
          placeholder={values?.hintText ? values.hintText : ""}
          rows={props.maxLines ? Number(props.maxLines) : 4} // Adjust the number of rows as needed
        />
      ) : (
        <Input
          onChange={(event): void => setValue(event.target.value)}
          placeholder={values?.hintText ? values.hintText : ""}
        />
      )}
    </AntForm.Item>
  );
};

WidgetRegistry.register("TextInput", TextInput);
