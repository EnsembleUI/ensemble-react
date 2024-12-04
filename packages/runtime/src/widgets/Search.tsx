import React, { useCallback, useState, useMemo, useEffect } from "react";
import { useDebounce } from "react-use";
import {
  useTemplateData,
  useRegisterBindings,
  CustomScopeProvider,
  unwrapWidget,
} from "@ensembleui/react-framework";
import type {
  CustomScope,
  EnsembleAction,
  Expression,
} from "@ensembleui/react-framework";
import { Select as SelectComponent } from "antd";
import { get, isEmpty, isNil, isObject, isString } from "lodash-es";
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
  value?: string;
  placeholder?: string;
  searchKey?: string;
  selectedLabel?: { [key: string]: unknown };
  onSearch?: {
    debounceMs: number;
  } & EnsembleAction;
  onChange?: EnsembleAction;
  onSelect?: EnsembleAction;
  onClear?: EnsembleAction;
  iconStyles?: EnsembleWidgetStyles;
  notFoundContent?: Expression<string> | { [key: string]: unknown };
} & EnsembleWidgetProps &
  HasItemTemplate & {
    "item-template"?: { value: Expression<string> };
  };

export const Search: React.FC<SearchProps> = ({
  "item-template": itemTemplate,
  styles,
  onSearch,
  searchKey,
  onChange,
  onSelect,
  onClear,
  value: initialValue,
  ...rest
}) => {
  const [searchValue, setSearchValue] = useState<string | null>(null);
  const [value, setValue] = useState<unknown>();

  const { namedData } = useTemplateData({
    data: itemTemplate?.data,
    name: itemTemplate?.name,
  });

  const { id, rootRef, values } = useRegisterBindings(
    { styles, value, ...rest, widgetName, initialValue },
    rest.id,
    {
      setValue,
    },
  );

  const onSearchAction = useEnsembleAction(onSearch);
  const onChangeAction = useEnsembleAction(onChange);
  const onSelectAction = useEnsembleAction(onSelect);
  const onClearAction = useEnsembleAction(onClear);

  const extractValue = useCallback(
    (option: unknown): string | number => {
      return get(
        option,
        searchKey
          ? [itemTemplate?.name ?? "", searchKey]
          : [(itemTemplate?.value || itemTemplate?.name) ?? ""],
      ) as string | number;
    },
    [itemTemplate?.name, itemTemplate?.value, searchKey],
  );

  const renderOptions = useMemo(() => {
    if (isEmpty(searchValue)) return [];

    let dropdownOptions: JSX.Element[] = [];

    if (isObject(itemTemplate) && !isEmpty(namedData)) {
      const tempOptions = namedData.map((item: unknown, index: number) => {
        const optionValue = extractValue(item);

        return (
          <SelectComponent.Option
            className={`${values?.id || ""}_option`}
            key={`${optionValue}_${index}`}
            value={optionValue}
          >
            <CustomScopeProvider value={item as CustomScope}>
              {EnsembleRuntime.render([itemTemplate.template])}
            </CustomScopeProvider>
          </SelectComponent.Option>
        );
      });

      dropdownOptions = [...dropdownOptions, ...tempOptions];
    }

    return dropdownOptions;
  }, [itemTemplate, namedData, extractValue, values?.id, searchValue]);

  useDebounce(
    () => {
      if (onSearchAction?.callback && !isEmpty(searchValue)) {
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
    [onChangeAction?.callback],
  );

  const handleSelect = useCallback(
    (selectedValue: unknown): void => {
      if (isObject(itemTemplate) && !isEmpty(namedData)) {
        setValue(selectedValue);
        setSearchValue(null);
        const selectedOption = namedData.find(
          (option) => extractValue(option) === selectedValue,
        );

        onSelectAction?.callback({
          value: get(selectedOption, [itemTemplate.name]) as unknown,
        });
      }
    },
    [itemTemplate, namedData, onSelectAction?.callback, extractValue],
  );

  const handleClear = useCallback(() => {
    setSearchValue(null);
    onClearAction?.callback();
  }, [onClearAction?.callback]);

  // handle not found content renderer
  const notFoundContentRenderer = useMemo(() => {
    const notFoundContent = values?.notFoundContent;

    if (!notFoundContent) {
      return "No Results";
    }

    return isString(notFoundContent)
      ? notFoundContent
      : EnsembleRuntime.render([unwrapWidget(notFoundContent)]);
  }, [values?.notFoundContent]);

  const renderLabel = useCallback(
    (label: React.ReactNode, labelValue: string | number): React.ReactNode => {
      if (isNil(rest.selectedLabel) || isEmpty(namedData)) {
        return label;
      }

      const option = namedData.find(
        (item) => extractValue(item) === labelValue,
      );
      return (
        <CustomScopeProvider value={{ value: option }}>
          {EnsembleRuntime.render([unwrapWidget(rest.selectedLabel)])}
        </CustomScopeProvider>
      );
    },
    [extractValue, namedData, rest.selectedLabel],
  );

  useEffect(() => {
    if (!value) setValue(initialValue);
  }, [value, initialValue]);

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
        defaultValue={values?.initialValue}
        filterOption={false}
        id={values?.id}
        labelRender={({ label, value: labelValue }): React.ReactNode =>
          renderLabel(label, labelValue)
        }
        notFoundContent={notFoundContentRenderer}
        onChange={handleChange}
        onClear={handleClear}
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
