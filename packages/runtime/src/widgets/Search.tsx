import type { ReactElement } from "react";
import React, { useCallback, useEffect, useState } from "react";
import {
  useTemplateData,
  useRegisterBindings,
  CustomScopeProvider,
} from "@ensembleui/react-framework";
import type {
  CustomScope,
  EnsembleAction,
  EnsembleWidget,
} from "@ensembleui/react-framework";
import { AutoComplete, Input } from "antd";
import { SearchOutlined } from "@mui/icons-material";
import { get, isArray, isNumber, isObject } from "lodash-es";
import { WidgetRegistry } from "../registry";
import type { EnsembleWidgetProps, HasItemTemplate } from "../shared/types";
import { useEnsembleAction } from "../runtime/hooks/useEnsembleAction";
import { EnsembleRuntime } from "../runtime";

export type SearchProps = {
  placeholder?: string;
  searchKey?: string;
  onSearch?: EnsembleAction;
  onChange?: EnsembleAction;
  onSelect?: EnsembleAction;
} & EnsembleWidgetProps &
  HasItemTemplate;

export const Search: React.FC<SearchProps> = ({
  placeholder,
  "item-template": itemTemplate,
  searchKey,
  styles,
  id,
  onSearch,
  onChange,
  onSelect,
}) => {
  const [options, setOptions] = useState<{ label: string; value: unknown }[]>(
    [],
  );
  const [value, setValue] = useState("");
  const [filteredOptions, setFilteredOptions] = useState<
    { label: string; value: unknown }[]
  >([]);

  const { namedData } = useTemplateData({
    data: itemTemplate?.data,
    name: itemTemplate?.name,
  });
  const { rootRef, values } = useRegisterBindings(
    { styles, value, options },
    id,
    {
      setValue,
      setOptions,
    },
  );
  const onSearchAction = useEnsembleAction(onSearch);
  const onChangeAction = useEnsembleAction(onChange);
  const onSelectAction = useEnsembleAction(onSelect);

  useEffect(() => {
    if (!isArray(namedData)) {
      return;
    }
    const newOptions = namedData.map((item) => {
      const option = {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        value: isObject(item) ? get(item, searchKey ?? "") : item,

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        label: itemTemplate?.template ? (
          <SearchOption
            context={item as CustomScope}
            template={itemTemplate.template}
          />
        ) : (
          get(item, searchKey ?? "")
        ),
      };
      return option;
    });
    setOptions(newOptions);
    setFilteredOptions(newOptions);
  }, [itemTemplate?.template, namedData, searchKey, setOptions, value]);

  // TODO: Pass in search predicate function via props or filter via API
  const handleSearch = useCallback(
    (search: string): void => {
      if (onSearchAction?.callback) {
        onSearchAction.callback({ search });
        return;
      }

      const matchingOptions = options.filter(
        (item) =>
          item.value?.toString()?.toLowerCase()?.includes(search.toLowerCase()),
      );
      setFilteredOptions(matchingOptions);
    },
    [onSearchAction, options],
  );

  const handleChange = useCallback(
    (newValue: string): void => {
      onChangeAction?.callback({ value: newValue });
    },
    [onChangeAction],
  );

  const handleSelect = useCallback(
    (selectedValue: string): void => {
      setValue(selectedValue);
      onSelectAction?.callback({ value: selectedValue });
    },
    [onSelectAction],
  );

  return (
    <>
      <AutoComplete
        allowClear
        id={id}
        onChange={handleChange}
        onSearch={handleSearch}
        onSelect={handleSelect}
        options={filteredOptions}
        popupMatchSelectWidth={
          isNumber(values?.styles?.width) ? values?.styles?.width : false
        }
        ref={rootRef}
      >
        <Input
          placeholder={placeholder}
          prefix={<SearchOutlined />}
          style={{
            boxShadow: "none",
            ...values?.styles,
          }}
        />
      </AutoComplete>
      {id ? (
        <style>
          {`
			/* Linear loader animation */
			#${id ?? ""} {
				background-color: ${
          values?.styles?.backgroundColor ? values.styles.backgroundColor : ""
        }
			}
		  `}
        </style>
      ) : null}
    </>
  );
};

const SearchOption = ({
  template,
  context,
}: {
  template: EnsembleWidget;
  context: CustomScope;
}): ReactElement => {
  return (
    <CustomScopeProvider value={context}>
      {EnsembleRuntime.render([template])}
    </CustomScopeProvider>
  );
};

WidgetRegistry.register("Search", Search);
