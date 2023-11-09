import { Form as AntForm, Select } from "antd";
import { useState } from "react";
import { useRegisterBindings } from "@ensembleui/react-framework";
import type { Expression } from "@ensembleui/react-framework";
import { WidgetRegistry } from "../registry";
import type { EnsembleWidgetProps } from "../shared/types";

export type DropdownProps = {
  label?: string;
  hintText?: string;
  items: SelectOption[];
} & EnsembleWidgetProps;

interface SelectOption {
  label: Expression<string>;
  value: Expression<string | number>;
}

const Dropdown: React.FC<DropdownProps> = (props) => {
  const [selectedValue, setSelectedValue] = useState<string>();
  const { values } = useRegisterBindings(
    { ...props, selectedValue },
    props.id,
    {
      setSelectedValue,
    },
  );
  const handleChange = (value: string): void => {
    setSelectedValue(value);
  };
  return (
    <AntForm.Item label={values?.label} name={values?.id}>
      <Select
        onChange={handleChange}
        placeholder={values?.hintText ? values.hintText : ""}
        value={values?.selectedValue}
      >
        {props.items.map((option, index) => (
          <Select.Option key={index} value={option.value}>
            {option.label}
          </Select.Option>
        ))}
      </Select>
    </AntForm.Item>
  );
};

WidgetRegistry.register("Dropdown", Dropdown);
