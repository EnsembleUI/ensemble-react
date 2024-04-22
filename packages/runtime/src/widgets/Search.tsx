import React, {
  useCallback,
  useEffect,
  useState,
  useMemo,
  type ReactElement,
} from "react";
import { useDebounce } from "react-use";
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
import { get, isEmpty, isNull, isNumber, isObject } from "lodash-es";
import { WidgetRegistry } from "../registry";
import type {
  EnsembleWidgetProps,
  EnsembleWidgetStyles,
  HasItemTemplate,
} from "../shared/types";
import { useEnsembleAction } from "../runtime/hooks/useEnsembleAction";
import { EnsembleRuntime } from "../runtime";

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
  HasItemTemplate;

export const Search: React.FC<SearchProps> = ({
  "item-template": itemTemplate,
  searchKey,
  styles,
  id,
  onSearch,
  onChange,
  onSelect,
  ...rest
}) => {
  const [options, setOptions] = useState<{ label: string; value: unknown }[]>(
    [],
  );
  const [searchValue, setSearchValue] = useState<string | null>(null);
  const [value, setValue] = useState("");

  const { namedData } = useTemplateData({
    data: itemTemplate?.data,
    name: itemTemplate?.name,
  });

  const { rootRef, values } = useRegisterBindings(
    { styles, value, options, ...rest },
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
    if (isEmpty(namedData)) {
      return;
    }

    const newOptions = namedData.map((item) => {
      const itemData = itemTemplate?.name
        ? (get(item, itemTemplate.name) as unknown)
        : item;

      const option = {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        value: isObject(itemData) ? get(itemData, searchKey ?? "") : itemData,

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        label: itemTemplate?.template ? (
          <SearchOption
            context={item as CustomScope}
            template={itemTemplate.template}
          />
        ) : (
          get(itemData, searchKey ?? "")
        ),
      };
      return option;
    });
    setOptions(newOptions);
  }, [itemTemplate, namedData, searchKey, setOptions, value]);

  const filteredOptions = useMemo(() => {
    const x = searchValue?.trim().length
      ? options.filter((item) =>
          item.value
            ?.toString()
            ?.toLowerCase()
            ?.includes(searchValue.trim().toLowerCase()),
        )
      : options;

    return x;
  }, [options, searchValue]);

  useDebounce(
    () => {
      if (onSearchAction?.callback && !isNull(searchValue)) {
        onSearchAction.callback({ search: searchValue });
      }
    },
    onSearch?.debounceMs,
    [searchValue],
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
        onSearch={(search): void => setSearchValue(search)}
        onSelect={handleSelect}
        options={filteredOptions}
        popupMatchSelectWidth={
          isNumber(values?.styles?.width) ? values?.styles?.width : false
        }
        ref={rootRef}
      >
        <Input
          placeholder={values?.placeholder}
          prefix={
            <SearchOutlined
              style={{
                ...values?.iconStyles,
              }}
            />
          }
          style={{
            boxShadow: "none",
            ...values?.styles,
            ...(values?.styles?.visible === false
              ? { display: "none" }
              : undefined),
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
