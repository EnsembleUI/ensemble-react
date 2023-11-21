import React, { useState } from "react";
import { useTemplateData, type Expression } from "@ensembleui/react-framework";
import type { SelectProps } from "antd";
import { AutoComplete, Input } from "antd";
import { SearchOutlined } from "@mui/icons-material";
import { get, isNumber, isObject, noop } from "lodash-es";
import { WidgetRegistry } from "../registry";
import type { EnsembleWidgetProps } from "../shared/types";
import { getColor } from "../shared/styles";

export type SearchProps = {
  placeholder?: string;
  data?: Expression<object>;
  searchKey?: string;
} & EnsembleWidgetProps;

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
        allowClear
        id={id}
        onSearch={handleSearch}
        // TODO: Handle on search result select

        onSelect={noop}
        options={options}
        popupMatchSelectWidth={isNumber(styles?.width) ? styles?.width : false}
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
      {id ? (
        <style>
          {`
			/* Linear loader animation */
			#${id ?? ""} {
				background-color: ${styles?.backgroundColor ? styles.backgroundColor : ""}
			}
		  `}
        </style>
      ) : null}
    </div>
  );
};

WidgetRegistry.register("Search", Search);
