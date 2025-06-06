import type { ReactElement } from "react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Expression, EnsembleAction } from "@ensembleui/react-framework";
import {
  unwrapWidget,
  useRegisterBindings,
  useTemplateData,
} from "@ensembleui/react-framework";
import { PlusCircleOutlined } from "@ant-design/icons";
import { Select as SelectComponent, Space, Form } from "antd";
import {
  get,
  isArray,
  isEmpty,
  isEqual,
  isObject,
  isString,
  toNumber,
} from "lodash-es";
import { useDebounce } from "react-use";
import { WidgetRegistry } from "../../registry";
import { useEnsembleAction } from "../../runtime/hooks/useEnsembleAction";
import type {
  EnsembleWidgetProps,
  EnsembleWidgetStyles,
} from "../../shared/types";
import { EnsembleRuntime } from "../../runtime";
import { getComponentStyles } from "../../shared/styles";
import type { HasBorder } from "../../shared/hasSchema";
import type { FormInputProps } from "./types";
import { EnsembleFormItem } from "./FormItem";
import type { SelectOption } from "./Dropdown";

const widgetName = "MultiSelect";

export type MultiSelectStyles = {
  multiSelectBackgroundColor?: string;
  multiSelectBorderRadius?: number;
  multiSelectBorderColor?: string;
  multiSelectBorderWidth?: number;
  multiSelectMaxHeight?: string;
  selectedBackgroundColor?: string;
  selectedTextColor?: string;
} & HasBorder &
  EnsembleWidgetStyles;

export type MultiSelectOption = SelectOption & {
  value: Expression<string | number | object>;
};

export type MultiSelectProps = {
  data: Expression<MultiSelectOption[]>;
  labelKey?: string;
  valueKey?: string;
  items?: Expression<MultiSelectOption[]>;
  onChange?: EnsembleAction;
  /** OnItemSelect is deprecated. Please use onChange instead */
  onItemSelect?: EnsembleAction;
  onSearch?: {
    debounceMs: number;
  } & EnsembleAction;
  hintStyle?: EnsembleWidgetStyles;
  allowCreateOptions?: boolean;
  /**	The max number of items can be selected */
  maxCount: Expression<number>;
  /** Max tag count to show */
  maxTagCount: Expression<number | "responsive">;
  /** Max tag text length to show */
  maxTagTextLength: Expression<number>;
  notFoundContent?: Expression<string> | { [key: string]: unknown };
} & EnsembleWidgetProps<MultiSelectStyles> &
  FormInputProps<object[] | string[]>;

const MultiSelect: React.FC<MultiSelectProps> = (props) => {
  const { data, ...rest } = props;
  const [options, setOptions] = useState<MultiSelectOption[]>([]);
  const [newOption, setNewOption] = useState("");
  const [selectedValues, setSelectedValues] = useState<MultiSelectOption[]>();
  const [searchValue, setSearchValue] = useState<string | null>(null);

  const action = useEnsembleAction(props.onChange);
  const onItemSelectAction = useEnsembleAction(props.onItemSelect);
  const onSearchAction = useEnsembleAction(props.onSearch);

  const { rawData } = useTemplateData({ data });
  const { id, rootRef, values } = useRegisterBindings(
    { ...rest, initialValue: props.value, selectedValues, options, widgetName },
    props.id,
    {
      setSelectedValues,
      setOptions,
    },
  );

  // used to store previous initial values
  const prevInitialValue = useRef([] as object[] | string[]);

  // check and load initial values
  useEffect(() => {
    // compare previous initial value with current render initial value
    if (
      !isEqual(prevInitialValue.current, values?.initialValue) &&
      isArray(values?.initialValue)
    ) {
      prevInitialValue.current = values?.initialValue || [];
      const initialValue = values?.initialValue.map((item) =>
        isObject(item)
          ? {
              ...(item as { [key: string]: unknown }),
              label: get(item, values.labelKey || "label") as string,
              value: get(item, values.valueKey || "value") as string,
            }
          : item,
      );
      setSelectedValues(initialValue as MultiSelectOption[]);
    }
  }, [values?.initialValue]);

  // load data and items
  useEffect(() => {
    const tempOptions: MultiSelectOption[] = [];

    if (isArray(rawData)) {
      tempOptions.push(
        ...rawData.map((item) => ({
          ...(item as { [key: string]: unknown }),
          label: get(item, values?.labelKey || "label") as string,
          value: get(item, values?.valueKey || "value") as string,
        })),
      );
    }

    if (
      values?.items &&
      isArray(values.items) &&
      values.items.every(
        (item) =>
          !tempOptions.find((option) => option.value === item.value.toString()),
      )
    ) {
      tempOptions.push(
        ...values.items.map((item) => ({
          ...item,
          label: item.label,
          value: item.value,
        })),
      );
    }

    setOptions(tempOptions);
  }, [rawData, values?.labelKey, values?.valueKey, values?.items]);

  // handle form instance
  const formInstance = Form.useFormInstance();
  useEffect(() => {
    if (formInstance) {
      formInstance.setFieldsValue({
        [values?.id ?? values?.label ?? ""]: selectedValues,
      });
    }
  }, [selectedValues, formInstance]);

  const handleSearch = (value: string): void => {
    if (props.onSearch) {
      setSearchValue(value);
      return;
    }
    const isOptionExist = options.find(
      (option) =>
        option.label.toString().toLowerCase().search(value.toLowerCase()) > -1,
    );

    if (!isOptionExist && values?.allowCreateOptions) {
      setNewOption(value);
    } else {
      setNewOption("");
    }
  };

  useDebounce(
    () => {
      if (onSearchAction?.callback && !isEmpty(searchValue)) {
        onSearchAction.callback({ search: searchValue });
      }
    },
    props.onSearch?.debounceMs || 0,
    [searchValue],
  );

  const handleFilterOption = (
    input: string,
    option?: MultiSelectOption,
  ): boolean => {
    return (
      option?.label
        .toString()
        ?.toLowerCase()
        ?.startsWith(input.toLowerCase()) || false
    );
  };

  // handle option change
  const handleChange = (
    value: MultiSelectOption[],
    option?: MultiSelectOption | MultiSelectOption[],
  ): void => {
    setSelectedValues(value);
    if (action) onChangeCallback({ value, option: option ?? [] });
    else onItemSelectCallback(value);

    if (newOption) {
      setOptions([
        ...options,
        {
          label: newOption,
          value: newOption,
        },
      ]);
      setNewOption("");
    }
  };

  // on item select callback
  const onChangeCallback = useCallback(
    (selected: {
      value: MultiSelectOption[];
      option: MultiSelectOption | MultiSelectOption[];
    }) => {
      action?.callback({ ...selected });
    },
    [action?.callback],
  );

  const onItemSelectCallback = useCallback(
    (value?: MultiSelectOption[]) => {
      onItemSelectAction?.callback({ selectedValues: value });
    },
    [onItemSelectAction?.callback],
  );

  // default value
  const defaultValue = useMemo(() => {
    if (isArray(values?.value)) {
      return values?.value;
    }
    if (isString(values?.value)) {
      return [values?.value || ""];
    }
  }, [values?.value]) as MultiSelectOption[];

  const labelRender = ({
    label = "",
  }: {
    label: React.ReactNode;
  }): React.ReactNode => {
    return isString(label)
      ? label
      : EnsembleRuntime.render([
          unwrapWidget(label as MultiSelectOption["label"]),
        ]);
  };

  const newOptionRender = (menu: ReactElement): ReactElement => (
    <Dropdown menu={menu} newOption={newOption} />
  );

  const notFoundContentRenderer = useMemo(() => {
    const notFoundContent = values?.notFoundContent;

    if (!notFoundContent) {
      return "No Results";
    }

    return isString(notFoundContent)
      ? notFoundContent
      : EnsembleRuntime.render([unwrapWidget(notFoundContent)]);
  }, [values?.notFoundContent]);

  return (
    <>
      <style>{`
        .${id}_input .ant-select-selector {
          ${getComponentStyles("multiSelect", values?.styles, true, true) as string}
        }
        .ant-select-item.ant-select-item-option.${id}_option[aria-selected="true"]
        {
          ${
            values?.styles?.selectedBackgroundColor
              ? `background-color: ${values.styles.selectedBackgroundColor};`
              : ""
          }
          ${
            values?.styles?.selectedTextColor
              ? `color: ${values.styles.selectedTextColor};`
              : ""
          }
        }
        .ant-col .ant-form-item-label > label[for=${id}] {
          ${
            values?.labelStyle?.color
              ? `color: ${values.labelStyle.color} !important;`
              : ""
          }
          ${
            values?.labelStyle?.fontSize
              ? `font-size: ${values.labelStyle.fontSize}px !important;`
              : ""
          }
          ${
            values?.labelStyle?.fontWeight
              ? `font-weight: ${values.labelStyle.fontWeight} !important;`
              : ""
          }
          ${
            values?.labelStyle?.fontFamily
              ? `font-family: ${values.labelStyle.fontFamily} !important;`
              : ""
          }
          ${
            values?.labelStyle?.backgroundColor
              ? `background-color: ${values.labelStyle.backgroundColor} !important;`
              : ""
          }
          ${
            values?.labelStyle?.borderRadius
              ? `border-radius: ${values.labelStyle.borderRadius}px !important;`
              : ""
          }
          ${
            values?.labelStyle?.borderColor
              ? `border-color: ${values.labelStyle.borderColor} !important;`
              : ""
          }
          ${
            values?.labelStyle?.borderWidth
              ? `border-width: ${values.labelStyle.borderWidth}px !important;`
              : ""
          }
          ${
            values?.labelStyle?.borderStyle
              ? `border-style: ${values.labelStyle.borderStyle} !important;`
              : ""
          }
        `}</style>
      <div ref={rootRef} style={{ flex: 1 }}>
        <EnsembleFormItem values={values}>
          <SelectComponent
            allowClear
            className={`${values?.styles?.names || ""} ${id}_input`}
            defaultValue={defaultValue}
            disabled={values?.enabled === false}
            dropdownRender={newOptionRender}
            dropdownStyle={values?.styles}
            filterOption={props.onSearch ? false : handleFilterOption}
            id={values?.id}
            labelRender={labelRender}
            maxCount={values?.maxCount ? toNumber(values.maxCount) : undefined}
            maxTagCount={
              values?.maxTagCount as number | "responsive" | undefined
            }
            maxTagTextLength={
              values?.maxTagTextLength
                ? toNumber(values.maxTagTextLength)
                : undefined
            }
            mode={values?.allowCreateOptions ? "tags" : "multiple"}
            notFoundContent={notFoundContentRenderer}
            onChange={handleChange}
            onSearch={handleSearch} // required for display new custom option with Dropdown element
            optionFilterProp="children"
            options={options}
            placeholder={
              values?.hintText ? (
                <span style={{ ...values.hintStyle }}>{values.hintText}</span>
              ) : (
                ""
              )
            }
            value={values?.selectedValues}
          />
        </EnsembleFormItem>
      </div>
    </>
  );
};

interface DropdownProps {
  menu: ReactElement;
  newOption: string;
}

const Dropdown: React.FC<DropdownProps> = ({ menu, newOption }) => {
  return (
    <>
      {menu}
      {newOption ? (
        <Space
          style={{
            padding: "10px 15px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            width: "100%",
            cursor: "pointer",
          }}
        >
          <span>There are no matches</span>
          <Space>
            <PlusCircleOutlined />
            <span>{`Add "${newOption}"`}</span>
          </Space>
        </Space>
      ) : null}
    </>
  );
};

WidgetRegistry.register(widgetName, MultiSelect);
