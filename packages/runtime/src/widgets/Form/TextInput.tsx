import { Input } from "antd";
// import { useFormContext } from "react-hook-form";
import { useRegisterBindings } from "framework";
import type { EnsembleWidgetProps } from "../../util/types";
import { WidgetRegistry } from "../../registry";
import type { FormInputProps } from "./types";

export type TextInputProps = EnsembleWidgetProps & FormInputProps;
export const TextInput: React.FC<TextInputProps> = (props) => {
  // const methods = useFormContext();
  const { values } = useRegisterBindings(props);
  return <Input required={values.required} />;
};

WidgetRegistry.register("TextInput", TextInput);
