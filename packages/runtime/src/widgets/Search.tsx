import React, { useCallback, useState, useMemo } from "react";
import { useDebounce } from "react-use";
import {
  useTemplateData,
  useRegisterBindings,
  CustomScopeProvider,
  evaluate,
  defaultScreenContext,
} from "@ensembleui/react-framework";
import type {
  CustomScope,
  EnsembleAction,
  Expression,
} from "@ensembleui/react-framework";
import { Select as SelectComponent } from "antd";
import { get, isEmpty, isNull, isObject } from "lodash-es";
import { WidgetRegistry } from "../registry";
import type {
  EnsembleWidgetProps,
  EnsembleWidgetStyles,
  HasItemTemplate,
} from "../shared/types";
import { useEnsembleAction } from "../runtime/hooks/useEnsembleAction";
import { EnsembleRuntime } from "../runtime";
import { Icon } from "./Icon";

const widgetName = "Search";

export type SearchProps = {
  placeholder?: string;
  searchKey?: string;
  onSearch?: {
    debounceMs: number;
  } & EnsembleAction;
  onChange?: EnsembleAction;
  onSelect?: EnsembleAction;
  iconStyles?: EnsembleWidgetStyles;
} & EnsembleWidgetProps &
  HasItemTemplate & {
    "item-template"?: { value: Expression<string> };
  };

export const Search: React.FC<SearchProps> = ({
  "item-template": itemTemplate,
  styles,
  onSearch,
  onChange,
  onSelect,
  ...rest
}) => {
  const [searchValue, setSearchValue] = useState<string | null>(null);
  const [value, setValue] = useState<unknown>();

  const { namedData } = useTemplateData({
    data: itemTemplate?.data,
    name: itemTemplate?.name,
  });

  const { id, rootRef, values } = useRegisterBindings(
    { styles, value, ...rest, widgetName },
    rest.id,
    {
      setValue,
    },
  );

  const onSearchAction = useEnsembleAction(onSearch);
  const onChangeAction = useEnsembleAction(onChange);
  const onSelectAction = useEnsembleAction(onSelect);

  // rendered options
  const renderOptions = useMemo(() => {
    let dropdownOptions = null;

    if (isObject(itemTemplate) && !isEmpty(namedData)) {
      const tempOptions = namedData.map((item: unknown) => {
        const optionValue = evaluate<string | number>(
          defaultScreenContext,
          itemTemplate.value,
          {
            [itemTemplate.name]: get(item, itemTemplate.name) as unknown,
          },
        );

        return (
          <SelectComponent.Option
            className={`${values?.id || ""}_option`}
            key={optionValue}
            value={optionValue}
          >
            <CustomScopeProvider value={item as CustomScope}>
              {EnsembleRuntime.render([itemTemplate.template])}
            </CustomScopeProvider>
          </SelectComponent.Option>
        );
      });

      dropdownOptions = [...(dropdownOptions || []), ...tempOptions];
    }

    return dropdownOptions;
  }, [values, itemTemplate, namedData]);

  useDebounce(
    () => {
      if (onSearchAction?.callback && !isNull(searchValue)) {
        onSearchAction.callback({ search: searchValue });
      }
    },
    onSearch?.debounceMs || 0,
    [searchValue],
  );

  const handleChange = useCallback(
    (newValue: string): void => {
      onChangeAction?.callback({ value: newValue });
    },
    [onChangeAction],
  );

  const handleSelect = useCallback(
    (selectedValue: unknown): void => {
      setValue(selectedValue);
      if (onSelectAction) {
        onSelectAction.callback({ selectedValue });
      }
    },
    [onSelectAction],
  );

  return (
    <div
      ref={rootRef}
      style={{
        display: "flex",
        overflow: "hidden",
        alignItems: "center",
        paddingLeft: "5px",
        ...values?.styles,
      }}
    >
      <style>
        {`
        .${id}_input {
          width: 100%;
          height: 100%;
        }
        .${id}_input .ant-select-selector {
          border: unset !important;
        }
        .${id}_input.ant-select-focused .ant-select-selector {
          box-shadow: unset !important;
        }
        `}
      </style>
      <Icon name="Search" />
      <SelectComponent
        allowClear
        className={`${values?.styles?.names || ""} ${id}_input`}
        filterOption={false}
        id={values?.id}
        notFoundContent="No Results"
        onChange={handleChange}
        onSearch={(search): void => setSearchValue(search)}
        onSelect={handleSelect}
        optionFilterProp="children"
        placeholder={values?.placeholder}
        showSearch
        suffixIcon={null}
      >
        {renderOptions}
      </SelectComponent>
    </div>
  );
};

WidgetRegistry.register(widgetName, Search);
