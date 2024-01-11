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
  value?: Expression<string | number>;
  items: SelectOption[];
  onItemSelect: EnsembleAction;
  autoComplete: Expression<boolean>;
} & EnsembleWidgetProps;

interface SelectOption {
  label: Expression<string>;
  value: Expression<string | number>;
}

const Dropdown: React.FC<DropdownProps> = (props) => {
  const [selectedValue, setSelectedValue] = useState(props.value);
  const { rootRef, values } = useRegisterBindings(
    { ...props, selectedValue },
    props.id,
    {
      setSelectedValue,
    },
  );
  const action = useEnsembleAction(props.onItemSelect);
  const onItemSelectCallback = useCallback(
    (value?: number | string) => {
      setSelectedValue(value);
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
      <div ref={rootRef}>
        <Select
          onSelect={onItemSelectCallback}
          placeholder={values?.hintText ? values.hintText : ""}
          showSearch={Boolean(values?.autoComplete)}
          value={values?.selectedValue}
        >
          {values?.items.map((option) => (
            <Select.Option key={option.value} value={option.value}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
      </div>
    </AntForm.Item>
  );
};

WidgetRegistry.register("Dropdown", Dropdown);
