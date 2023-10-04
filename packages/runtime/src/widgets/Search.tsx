import React, { useState } from "react";
import { useTemplateData, type Expression } from "framework";
import { AutoComplete, Input, SelectProps } from "antd";
import { WidgetRegistry } from "../registry";
import type { SearchStyles } from "../util/types";
import { SearchOutlined } from "@mui/icons-material";
import { get, isObject, isString } from "lodash-es";
import { getColor, handleCurlyBraces } from "../util/utils";

interface EnsembleWidgetProps<T> {
  id?: string;
  [key: string]: unknown;
  styles?: T;
}

export type SearchProps = {
  placeholder?: string;
  data?: Expression<object>;
  searchKey?: string;
} & EnsembleWidgetProps<SearchStyles>;

export const Search: React.FC<SearchProps> = ({
  placeholder,
  data,
  searchKey,
  styles,
}) => {
  const [options, setOptions] = useState<SelectProps<object>["options"]>([]);

  const templateData = useTemplateData(
    isString(data) ? handleCurlyBraces(data) : (data as Expression<object>)
  );

  const handleSearch = (value: string) => {
    if (Array.isArray(templateData)) {
      setOptions(
        value
          ? templateData
              .filter(
                (item) =>
                  (isObject(item) ? get(item, searchKey ?? "") : item)
                    ?.toString()
                    ?.toLowerCase()
                    ?.includes(value.toLowerCase())
              )
              .map((item) => ({
                value: isObject(item) ? get(item, searchKey ?? "") : item,
                label: isObject(item) ? get(item, searchKey ?? "") : item,
              }))
          : []
      );
    }
  };

  return (
    <AutoComplete
      popupMatchSelectWidth={styles?.width}
      options={options}
      onSelect={() => {}}
      onSearch={handleSearch}
      size="large"
      allowClear
    >
      <Input
        placeholder={placeholder}
        prefix={<SearchOutlined />}
        style={{
          width: styles?.width,
          height: styles?.height,
          margin: styles?.margin,
          borderRadius: styles?.borderRadius,
          borderWidth: styles?.borderWidth,
          borderStyle: styles?.borderStyle,
          borderColor: styles?.borderColor
            ? getColor(styles?.borderColor)
            : undefined,
          boxShadow: "none",
        }}
      />
    </AutoComplete>
  );
};

WidgetRegistry.register("Search", Search);
