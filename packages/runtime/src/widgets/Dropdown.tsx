import { Form as AntForm, Select } from "antd";
import { useCallback, useState } from "react";
import { useRegisterBindings } from "@ensembleui/react-framework";
import type { EnsembleAction, Expression } from "@ensembleui/react-framework";
import { WidgetRegistry } from "../registry";
import type { EnsembleWidgetProps } from "../shared/types";
import { useEnsembleAction } from "../runtime/hooks/useEnsembleAction";

export type DropdownProps = {
  label?: string;
  hintText?: string;
  items: SelectOption[];
  onItemSelect: EnsembleAction;
} & EnsembleWidgetProps;

interface SelectOption {
  label: Expression<string>;
  value: Expression<string | number>;
}

const Dropdown: React.FC<DropdownProps> = (props) => {
  const [selectedValue, setSelectedValue] = useState<string>();
  const handleChange = (value: string): void => {
    setSelectedValue(value);
  };
  const { values } = useRegisterBindings(
    { ...props, selectedValue },
    props.id,
    {
      setSelectedValue,
    },
  );
  const action = useEnsembleAction(props.onItemSelect);
  const onItemSelectCallback = useCallback(
    (value: string) => {
      if (action) {
        action.callback({ selectedValue: value });
      }
    },
    [action],
  );
  return (
    <AntForm.Item
      className={values?.styles?.names}
      label={values?.label}
      name={values?.id}
      style={{
        ...values?.styles,
      }}
    >
      <Select
        onChange={handleChange}
        onSelect={onItemSelectCallback}
        placeholder={values?.hintText ? values.hintText : ""}
        value={values?.selectedValue}
      >
        {values?.items.map((option, index) => (
          <Select.Option key={index} value={option.value}>
            {option.label}
          </Select.Option>
        ))}
      </Select>
    </AntForm.Item>
  );
};

WidgetRegistry.register("Dropdown", Dropdown);
