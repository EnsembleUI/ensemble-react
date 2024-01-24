import { Input } from "antd";
import { useRegisterBindings } from "@ensembleui/react-framework";
import { useState } from "react";
import type { EnsembleWidgetProps } from "../../shared/types";
import { WidgetRegistry } from "../../registry";
import type { TextStyles } from "../Text";
import type { FormInputProps } from "./types";
import { EnsembleFormItem } from "./FormItem";

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
    <EnsembleFormItem values={values}>
      {props.multiLine ? (
        <Input.TextArea
          onChange={(event): void => setValue(event.target.value)}
          placeholder={values?.hintText ?? ""}
          rows={props.maxLines ? Number(props.maxLines) : 4} // Adjust the number of rows as needed
          style={{
            ...(values?.value ? values.styles : values?.hintStyle),
          }}
        />
      ) : (
        <Input
          onChange={(event): void => setValue(event.target.value)}
          placeholder={values?.hintText ?? ""}
          style={{
            ...(values?.value ? values.styles : values?.hintStyle),
          }}
        />
      )}
    </EnsembleFormItem>
  );
};

WidgetRegistry.register("TextInput", TextInput);
