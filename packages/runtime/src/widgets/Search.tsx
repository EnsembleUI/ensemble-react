import React, { useState } from "react";
import { useTemplateData, type Expression } from "framework";
import type { SelectProps } from "antd";
import { AutoComplete, Input } from "antd";
import { SearchOutlined } from "@mui/icons-material";
import { get, isObject } from "lodash-es";
import { WidgetRegistry } from "../registry";
import type { SearchStyles } from "../util/types";
import { getColor } from "../util/utils";

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

  const templateData = useTemplateData(data!);

  // TODO: Pass in search predicate function via props or filter via API
  const handleSearch = (value: string) => {
    if (Array.isArray(templateData)) {
      setOptions(
        value
          ? templateData
              .filter(
                (item) =>
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                  (isObject(item) ? get(item, searchKey ?? "") : item)
                    ?.toString()
                    ?.toLowerCase()
                    ?.includes(value.toLowerCase()),
              )
              .map((item) => ({
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                value: isObject(item) ? get(item, searchKey ?? "") : item,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                label: isObject(item) ? get(item, searchKey ?? "") : item,
              }))
          : [],
      );
    }
  };

  return (
    <AutoComplete
      allowClear
      onSearch={handleSearch}
      // TODO: Handle on search result select
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onSelect={() => {}}
      options={options}
      popupMatchSelectWidth={styles?.width}
      size="large"
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
            ? getColor(styles.borderColor)
            : undefined,
          boxShadow: "none",
        }}
      />
    </AutoComplete>
  );
};

WidgetRegistry.register("Search", Search);
