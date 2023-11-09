import { Form as AntForm, Checkbox } from "antd";
import { useState } from "react";
import { useRegisterBindings } from "@ensembleui/react-framework";
import type { EnsembleWidgetProps } from "../../shared/types";
import { WidgetRegistry } from "../../registry";
import type { FormInputProps } from "./types";

export type CheckBoxProps = {
  trailingText?: string;
  leadingText?: string;
} & EnsembleWidgetProps &
  FormInputProps<boolean>;

export const CheckboxWidget: React.FC<CheckBoxProps> = (props) => {
  const [checked, setChecked] = useState(props.value || false);
  const { values } = useRegisterBindings(
    { ...props, value: checked },
    props.id,
    {
      setValue: setChecked,
    },
  );
  return (
    <AntForm.Item
      label={values?.label}
      name={values?.label}
      rules={[{ required: values?.required }]}
      style={{
        margin: "0px",
      }}
      valuePropName="checked"
    >
      {" "}
      {props.leadingText ? props.leadingText : ""}
      <Checkbox
        checked={checked}
        disabled={!props.enabled}
        onChange={(event): void => setChecked(event.target.checked)}
        style={{
          marginLeft: `${props.leadingText ? "4px" : "0px"}`,
        }}
      >
        {values?.trailingText}
      </Checkbox>
    </AntForm.Item>
  );
};

WidgetRegistry.register("Checkbox", CheckboxWidget);
