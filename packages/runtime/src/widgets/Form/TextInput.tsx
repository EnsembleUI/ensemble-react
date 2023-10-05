import { Input } from "antd";
import { useRegisterBindings } from "framework";
import { Controller } from "react-hook-form";
import type { ReactElement } from "react";
import type { EnsembleWidgetProps } from "../../util/types";
import { WidgetRegistry } from "../../registry";
import type { FormInputProps } from "./types";

export type TextInputProps = EnsembleWidgetProps & FormInputProps;
export const TextInput: React.FC<TextInputProps> = (props) => {
  const { values } = useRegisterBindings(props);
  return (
    <Controller
      name={values.label}
      render={({ field: { onChange, onBlur, value } }): ReactElement => {
        return (
          <Input
            addonBefore={values.label}
            onBlur={onBlur}
            onChange={onChange}
            required={values.required}
            value={value ? String(value) : undefined}
          />
        );
      }}
    />
  );
};

WidgetRegistry.register("TextInput", TextInput);
