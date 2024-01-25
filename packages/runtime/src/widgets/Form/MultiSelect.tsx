import type { ReactElement } from "react";
import React, { useCallback, useEffect, useState } from "react";
import type { Expression, EnsembleAction } from "@ensembleui/react-framework";
import {
  useRegisterBindings,
  useTemplateData,
} from "@ensembleui/react-framework";
import { PlusCircleOutlined } from "@ant-design/icons";
import { Select as SelectComponent, Space } from "antd";
import { get } from "lodash-es";
import { WidgetRegistry } from "../../registry";
import { getColor } from "../../shared/styles";
import { useEnsembleAction } from "../../runtime/hooks/useEnsembleAction";
import { EnsembleFormItem } from "./FormItem";
import type { FormInputProps } from "./types";

interface SelectOption {
  label: Expression<string>;
  value: Expression<string | number>;
}

export type MultiSelectProps = {
  data: Expression<SelectOption[]>;
  labelKey?: string;
  valueKey?: string;
  default?: SelectOption[];
  placeholder?: Expression<string>;
  onItemSelect?: EnsembleAction;
} & FormInputProps<string[]>;

const MultiSelect: React.FC<MultiSelectProps> = (props) => {
  const {
    data,
    labelKey,
    valueKey,
    default: defaultOptions,
    placeholder,
    styles,
  } = props;
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [newOption, setNewOption] = useState("");
  const [selectedValues, setSelectedValues] = useState<string[] | undefined>(
    defaultOptions?.map((item) => item.value.toString()),
  );
  const action = useEnsembleAction(props.onItemSelect);
  const { rawData } = useTemplateData({ data });

  useEffect(() => {
    if (Array.isArray(rawData)) {
      const initialOptions = rawData.map((item) => ({
        label: get(item, labelKey ?? "label") as Expression<string>,
        value: get(item, valueKey ?? "value") as Expression<string | number>,
      }));

      if (defaultOptions) {
        defaultOptions.forEach((item) => {
          if (!initialOptions.some((option) => option.value === item.value))
            initialOptions.push(item);
        });
      }
      setOptions(initialOptions);
    }
  }, [rawData, defaultOptions, labelKey, valueKey]);

  const handleChange = (value: string[]): void => {
    setSelectedValues(value);
    onItemSelectCallback(value);
    if (newOption) {
      setOptions([
        ...options,
        {
          label: newOption,
          value: newOption,
        },
      ]);
      setNewOption("");
    }
  };

  const { values } = useRegisterBindings(
    { value: selectedValues, options },
    props.id,
    {
      setSelectedValues,
      setOptions,
    },
  );
  const onItemSelectCallback = useCallback(
    (value?: string[]) => {
      if (action) {
        action.callback({ selectedValues: value });
      }
    },
    [action],
  );
  return (
    <EnsembleFormItem values={props}>
      <SelectComponent
        allowClear
        defaultValue={defaultOptions?.map((item) => item.value.toString())}
        // eslint-disable-next-line react/no-unstable-nested-components
        dropdownRender={(menu): ReactElement => (
          <Dropdown menu={menu} newOption={newOption} />
        )}
        filterOption={(input, option): boolean =>
          option?.label
            .toString()
            .toLowerCase()
            .startsWith(input.toLowerCase()) || false
        }
        mode="tags"
        notFoundContent="No Results"
        onChange={handleChange}
        onSearch={(v): void => {
          if (
            options.some((option) =>
              option.label.toString().toLowerCase().startsWith(v.toLowerCase()),
            )
          )
            setNewOption("");
          else setNewOption(v);
        }}
        options={values?.options}
        placeholder={placeholder ?? "Select"}
        style={{
          width: styles?.width ?? "100%",
          margin: styles?.margin,
          borderRadius: styles?.borderRadius,
          borderWidth: styles?.borderWidth,
          borderStyle: styles?.borderStyle,
          borderColor: styles?.borderColor
            ? getColor(styles.borderColor)
            : undefined,
          ...styles,
        }}
        value={values?.value}
      />
    </EnsembleFormItem>
  );
};

interface DropdownProps {
  menu: ReactElement;
  newOption: string;
}
const Dropdown: React.FC<DropdownProps> = ({ menu, newOption }) => {
  return (
    <>
      {menu}
      {newOption ? (
        <Space
          style={{
            padding: "10px 15px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            width: "100%",
            cursor: "pointer",
          }}
        >
          <span>There are no matches</span>
          <Space>
            <PlusCircleOutlined />
            <span>{`Add "${newOption}"`}</span>
          </Space>
        </Space>
      ) : null}
    </>
  );
};

WidgetRegistry.register("MultiSelect", MultiSelect);