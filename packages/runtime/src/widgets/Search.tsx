import React, { useState } from "react";
import { useTemplateData, type Expression } from "@ensembleui/react-framework";
import type { SelectProps } from "antd";
import { AutoComplete, Input } from "antd";
import { SearchOutlined } from "@mui/icons-material";
import { get, isObject } from "lodash-es";
import { WidgetRegistry } from "../registry";
import type { EnsembleWidgetProps, HasBorder } from "../shared/types";
import { getColor } from "../shared/styles";

export type SearchStyles = {
  width?: number;
  height?: number;
  margin?: number | string;
  backgroundColor?: string;
} & HasBorder;

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
  id,
}) => {
  const [options, setOptions] = useState<SelectProps<object>["options"]>([]);

  const { rawData } = useTemplateData({ data: data! });

  // TODO: Pass in search predicate function via props or filter via API
  const handleSearch = (value: string) => {
    if (Array.isArray(rawData)) {
      setOptions(
        value
          ? rawData
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
    <div>
      <AutoComplete
        id={id}
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
            backgroundColor: styles?.backgroundColor,
            boxShadow: "none",
          }}
        />
      </AutoComplete>
      <style>
        {`
			/* Linear loader animation */
			#${id ?? ""} {
				background-color: ${styles?.backgroundColor ? styles.backgroundColor : ""}
			}
		  `}
      </style>
    </div>
  );
};

WidgetRegistry.register("Search", Search);
