import React, { useState } from "react";
import {
  useTemplateData,
  type Expression,
  type EnsembleAction,
  useRegisterBindings,
} from "framework";
import type { SelectProps } from "antd";
import { AutoComplete, Input } from "antd";
import { SearchOutlined } from "@mui/icons-material";
import { get, isObject } from "lodash-es";
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
  // eslint-disable-next-line no-empty-pattern
  const {} = useRegisterBindings(
    {
      value,
    },
    id,
    { setValue },
  );

  const templateData = useTemplateData(data ?? "");
  const valueChangeAction = useEnsembleAction(onValueChange);
  const selectAction = useEnsembleAction(onSelect);

  const handleSearch = (search: string): void => {
    if (Array.isArray(templateData)) {
      setOptions(
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
    } else if (onValueChange) {
      (async (): Promise<void> => {
        const apiResponse = await valueChangeAction?.callback();

        if (apiResponse) {
          setOptions(
            findValuesByKey<string>(apiResponse, searchKey ?? "")
              .filter((item) =>
                item.toLowerCase().includes(search.toLowerCase()),
              )
              .map((item) => ({
                value: item,
                label: item,
              })),
          );
        }
      })().catch((e) => {
        throw e;
      });
    }
  };

  return (
    <AutoComplete
      allowClear
      onSearch={handleSearch}
      onSelect={(selectedValue: string): void => {
        setValue(selectedValue);
        onSelect && selectAction?.callback();
      }}
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

function findValuesByKey<T>(obj: any, key: string): T[] {
  let results: T[] = [];

  if (obj && typeof obj === "object") {
    for (const k in obj) {
      if (k === key) results.push(obj[k]);
      else {
        const nestedResults = findValuesByKey<T>(obj[k], key);
        results = results.concat(nestedResults);
      }
    }
  }

  return results;
}
