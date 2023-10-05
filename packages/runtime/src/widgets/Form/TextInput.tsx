import { Form as AntForm, Input } from "antd";
import { useRegisterBindings } from "framework";
import type { EnsembleWidgetProps } from "../../util/types";
import { WidgetRegistry } from "../../registry";
import type { FormInputProps } from "./types";

export type TextInputProps = EnsembleWidgetProps & FormInputProps;
export const TextInput: React.FC<TextInputProps> = (props) => {
  const { values } = useRegisterBindings(props);
  return (
    <AntForm.Item
      label={values.label}
      name={values.label}
      rules={[{ required: values.required }]}
    >
      <Input />
    </AntForm.Item>
  );
};

WidgetRegistry.register("TextInput", TextInput);
