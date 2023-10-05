import React, { useEffect, useState } from "react";
import { Expression, useTemplateData } from "framework";
import { WidgetRegistry } from "../registry";
import { PlusCircleOutlined } from "@ant-design/icons";
import { Select as SelectComponent, Space } from "antd";
import { get } from "lodash-es";
import { SearchStyles } from "../util/types";
import { EnsembleWidgetProps, getColor } from "../util/utils";

type SelectOption = {
  label: Expression<string>;
  value: Expression<string | number>;
};

export type MultiSelectProps = {
  data: Expression<SelectOption[]>;
  labelKey?: string;
  valueKey?: string;
  default?: SelectOption[];
  placeholder?: Expression<string>;
} & EnsembleWidgetProps<SearchStyles>;

const MultiSelect: React.FC<MultiSelectProps> = ({
  data,
  labelKey,
  valueKey,
  default: defaultOptions,
  placeholder,
  styles,
}) => {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [newOption, setNewOption] = useState("");
  const [selectedValues, setSelectedValues] = useState<string[] | undefined>(
    defaultOptions?.map((item) => item.value?.toString())
  );

  const templateData = useTemplateData(data);

  useEffect(() => {
    if (Array.isArray(templateData)) {
      const initialOptions = templateData.map((item) => ({
        label: get(item, labelKey ?? "label"),
        value: get(item, valueKey ?? "value"),
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

  return (
    <SelectComponent
      mode="tags"
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
      placeholder={placeholder ?? "Select"}
      onChange={handleChange}
      value={selectedValues}
      defaultValue={defaultOptions?.map((item) => item.value?.toString())}
      notFoundContent={<></>}
      options={options}
      allowClear
      filterOption={(input, option) =>
        option?.label
          ?.toString()
          .toLowerCase()
          .startsWith(input.toLowerCase()) || false
      }
      onSearch={(v) => {
        if (
          options.some(
            (option) =>
              option?.label
                ?.toString()
                .toLowerCase()
                .startsWith(v.toLowerCase())
          )
        )
          setNewOption("");
        else setNewOption(v);
      }}
      dropdownRender={(menu) => (
        <>
          {menu}
          {newOption && (
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
          )}
        </>
      )}
    />
  );
};

WidgetRegistry.register("MultiSelect", MultiSelect);
