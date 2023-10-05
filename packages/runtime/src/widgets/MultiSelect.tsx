import type { ReactElement } from "react";
import React, { useEffect, useState } from "react";
import type { Expression } from "framework";
import { useRegisterBindings, useTemplateData } from "framework";
import { PlusCircleOutlined } from "@ant-design/icons";
import { Select as SelectComponent, Space } from "antd";
import { get } from "lodash-es";
import { WidgetRegistry } from "../registry";
import type { SearchStyles } from "../util/types";
import type { EnsembleWidgetProps } from "../util/utils";
import { getColor } from "../util/utils";

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
} & EnsembleWidgetProps<SearchStyles>;

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
    defaultOptions?.map((item) => item.value.toString())
  );

  const templateData = useTemplateData(data);

  useEffect(() => {
    if (Array.isArray(templateData)) {
      const initialOptions = templateData.map((item) => ({
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
  }, [templateData, defaultOptions]);

  const handleChange = (value: string[]) => {
    setSelectedValues(value);
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
    }
  );

  return (
    <SelectComponent
      allowClear
      defaultValue={defaultOptions?.map((item) => item.value.toString())}
      // eslint-disable-next-line react/no-unstable-nested-components
      dropdownRender={(menu) => <Dropdown menu={menu} newOption={newOption} />}
      filterOption={(input, option) =>
        option?.label
          .toString()
          .toLowerCase()
          .startsWith(input.toLowerCase()) || false
      }
      mode="tags"
      notFoundContent={<></>}
      onChange={handleChange}
      onSearch={(v) => {
        if (
          values.options.some((option) =>
            option.label.toString().toLowerCase().startsWith(v.toLowerCase())
          )
        )
          setNewOption("");
        else setNewOption(v);
      }}
      options={values.options}
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
      }}
      value={values.value}
    />
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
