import type { Expression } from "@ensembleui/react-framework";
import { useRegisterBindings } from "@ensembleui/react-framework";
import { Radio } from "antd";
import { useState } from "react";
import { WidgetRegistry } from "../../registry";
import type { HasItemTemplate } from "../../shared/types";
import type { FormInputProps } from "./types";
import { EnsembleFormItem } from "./FormItem";

export type RadioWidgetProps = FormInputProps<string> &
  HasItemTemplate & {
    items: {
      label: Expression<string>;
      value: Expression<string | number>;
    }[];
  };
export const RadioWidget: React.FC<RadioWidgetProps> = (props) => {
  const [value, setValue] = useState(props.value);
  const { values, rootRef } = useRegisterBindings(
    { ...props, value },
    props.id,
    { setValue },
  );

  return (
    <EnsembleFormItem values={values}>
      <Radio.Group
        disabled={
          values?.enabled === undefined ? false : Boolean(values.enabled)
        }
        onChange={(event): void => setValue(String(event.target.value))}
        ref={rootRef}
        style={values?.styles}
        value={values?.value}
      >
        {values?.items.map((item) => (
          <Radio key={item.value} value={item.value}>
            {item.label}
          </Radio>
        ))}
      </Radio.Group>
    </EnsembleFormItem>
  );
};

WidgetRegistry.register("Radio", RadioWidget);
