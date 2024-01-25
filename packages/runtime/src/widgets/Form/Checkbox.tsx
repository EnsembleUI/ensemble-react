import { Checkbox } from "antd";
import { useState } from "react";
import { useRegisterBindings } from "@ensembleui/react-framework";
import type { EnsembleWidgetProps } from "../../shared/types";
import { WidgetRegistry } from "../../registry";
import type { FormInputProps } from "./types";
import { EnsembleFormItem } from "./FormItem";

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
    <EnsembleFormItem valuePropName="checked" values={values}>
      <Checkbox
        checked={Boolean(values?.value)}
        disabled={
          values?.enabled === undefined ? false : Boolean(values.enabled)
        }
        onChange={(event): void => setChecked(event.target.checked)}
        style={{
          marginLeft: `${props.leadingText ? "4px" : "0px"}`,
          ...values?.styles,
        }}
      >
        {values?.trailingText}
      </Checkbox>
    </EnsembleFormItem>
  );
};

WidgetRegistry.register("Checkbox", CheckboxWidget);
