import { Form as AntForm, Select } from "antd";
import { useCallback, useMemo, useState } from "react";
import {
  CustomScopeProvider,
  evaluate,
  useRegisterBindings,
  useTemplateData,
  defaultScreenContext,
} from "@ensembleui/react-framework";
import type {
  CustomScope,
  EnsembleAction,
  EnsembleWidget,
  Expression,
  TemplateData,
} from "@ensembleui/react-framework";
import { get, isObject } from "lodash-es";
import { WidgetRegistry } from "../registry";
import type { EnsembleWidgetProps } from "../shared/types";
import { useEnsembleAction } from "../runtime/hooks/useEnsembleAction";
import { EnsembleRuntime } from "../runtime";

export interface DropdownItemTemplace {
  data: Expression<TemplateData>;
  name: string;
  template: EnsembleWidget;
  value: Expression<string>;
}

export type DropdownProps = {
  label?: string;
  hintText?: string;
  value?: Expression<string | number>;
  items?: SelectOption[];
  onItemSelect: EnsembleAction;
  autoComplete: Expression<boolean>;
  "item-template"?: DropdownItemTemplace;
} & EnsembleWidgetProps;

interface SelectOption {
  label: Expression<string>;
  value: Expression<string | number>;
}

const Dropdown: React.FC<DropdownProps> = (props) => {
  const [selectedValue, setSelectedValue] = useState(props.value);
  const { "item-template": itemTemplate, ...rest } = props;
  const { rootRef, values } = useRegisterBindings(
    { ...rest, selectedValue },
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

  const { namedData } = useTemplateData({
    data: itemTemplate?.data,
    name: itemTemplate?.name,
  });

  const options = useMemo(() => {
    if (values?.items) {
      return values.items.map((item) => {
        return (
          <Select.Option key={item.value} value={item.value}>
            {item.label}
          </Select.Option>
        );
      });
    }

    if (isObject(itemTemplate)) {
      return namedData.map((item: unknown, index) => {
        return (
          <Select.Option
            key={index}
            value={evaluate(defaultScreenContext, itemTemplate.value, {
              [itemTemplate.name]: get(item, itemTemplate.name) as unknown,
            })}
          >
            <CustomScopeProvider key={index} value={item as CustomScope}>
              {EnsembleRuntime.render([itemTemplate.template])}
            </CustomScopeProvider>
          </Select.Option>
        );
      });
    }
  }, [values?.items, namedData, itemTemplate]);

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
          {options}
        </Select>
      </div>
    </AntForm.Item>
  );
};

WidgetRegistry.register("Dropdown", Dropdown);
