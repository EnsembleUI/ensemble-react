import React, { useState } from "react";
import { useEnsembleStore, type Expression } from "framework";
import { AutoComplete, Input, SelectProps } from 'antd';
import { WidgetRegistry } from "../registry";
import type { EnsembleWidgetProps } from "../util/types";
import { SearchOutlined } from "@mui/icons-material";
import { get } from "lodash-es";

export type SearchProps = {
  placeholder?: Expression<string>;
  data?: unknown;
  searchKey: Expression<string>;
} & EnsembleWidgetProps;

export const Search: React.FC<SearchProps> = ({
  placeholder,
  data,
  searchKey
}) => {
  const [options, setOptions] = useState<SelectProps<object>['options']>([]);

  const { templateData = [] } = useEnsembleStore((state) => ({
    templateData: get(state.screen, data as string) as object,
  }));

  const handleSearch = (value: string) => {
    if(Array.isArray(templateData)) {
      setOptions(value ? templateData.filter(t => t[searchKey].startsWith(value)).map(t => {
        return {
          label: t[searchKey],
          value: t[searchKey],
        }
      }) : []);
    }
  };

  return (
    <AutoComplete
      popupMatchSelectWidth={252}
      style={{ width: 300 }}
      options={options}
      onSelect={() => {}}
      onSearch={handleSearch}
      size="large"
    >
      <Input placeholder={placeholder} prefix={<SearchOutlined />} />
    </AutoComplete>
  );
};

WidgetRegistry.register("Search", Search);
