import React, { useState } from "react";
import {
  useTemplateData,
  type Expression,
  type EnsembleAction,
  type Response,
  useRegisterBindings,
} from "framework";
import type { SelectProps } from "antd";
import { AutoComplete, Input } from "antd";
import { SearchOutlined } from "@mui/icons-material";
import { get, isObject, map } from "lodash-es";
import { WidgetRegistry } from "../registry";
import type { SearchStyles } from "../util/types";
import { getColor } from "../util/utils";
import { useEnsembleAction } from "../runtime/hooks/useEnsembleAction";

interface EnsembleWidgetProps<T> {
  id?: string;
  [key: string]: unknown;
  styles?: T;
}

export type SearchProps = {
  placeholder?: string;
  data?: Expression<object>;
  searchKey?: string;
  onValueChange?: EnsembleAction;
  onSelect?: EnsembleAction;
} & EnsembleWidgetProps<SearchStyles>;

export const Search: React.FC<SearchProps> = ({
  id,
  placeholder,
  data,
  searchKey,
  onValueChange,
  onSelect,
  styles,
}) => {
  const [options, setOptions] = useState<SelectProps<object>["options"]>([]);
  const [value, setValue] = useState("");
  const [filteredOptions, setFilteredOptions] = useState<
    SelectProps<object>["options"]
  >([]);
  const templateData = useTemplateData(data ?? "");
  const valueChangeAction = useEnsembleAction(onValueChange);
  const selectAction = useEnsembleAction(onSelect);

  useRegisterBindings(
    {
      value,
      options,
    },
    id,
    { setValue, setOptions },
  );

  const handleSearch = (search: string): void => {
    if (templateData && Array.isArray(templateData) && templateData.length > 0)
      setFilteredOptions(
        search
          ? templateData
              .filter(
                (item) =>
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                  (isObject(item) ? get(item, searchKey ?? "") : item)
                    ?.toString()
                    ?.toLowerCase()
                    ?.includes(search.toLowerCase()),
              )
              .map((item) => ({
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                value: isObject(item) ? get(item, searchKey ?? "") : item,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                label: isObject(item) ? get(item, searchKey ?? "") : item,
              }))
          : [],
      );
    else if (options)
      setFilteredOptions(
        search
          ? options.filter(
              (item) =>
                item.value
                  ?.toString()
                  ?.toLowerCase()
                  ?.includes(search.toLowerCase()),
            )
          : [],
      );
  };

  const handleChange = (search: string): void => {
    if (!onValueChange?.invokeApi) valueChangeAction?.callback();
    else {
      (async (): Promise<void> => {
        const apiResponse = (await valueChangeAction?.callback()) as
          | Response
          | undefined;
        if (!apiResponse) return;

        let mappedRes =
          typeof apiResponse.body === "string"
            ? [
                {
                  value: apiResponse.body,
                  label: apiResponse.body,
                },
              ]
            : map(apiResponse.body, (item) => ({
                value: item,
                label: item,
              }));
        if (search)
          mappedRes = mappedRes.filter((item) =>
            item.value.toLowerCase().includes(search.toLowerCase()),
          );

        setFilteredOptions(mappedRes);
      })().catch((e) => {
        // eslint-disable-next-line no-console
        console.error(e);
      });
    }
  };

  return (
    <AutoComplete
      allowClear
      onChange={handleChange}
      onSearch={handleSearch}
      onSelect={(selectedValue: string): void => {
        setValue(selectedValue);
        onSelect && selectAction?.callback();
      }}
      options={filteredOptions}
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
