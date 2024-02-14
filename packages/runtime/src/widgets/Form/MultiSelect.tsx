import type { ReactElement } from "react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { Expression, EnsembleAction } from "@ensembleui/react-framework";
import {
  unwrapWidget,
  useRegisterBindings,
  useTemplateData,
} from "@ensembleui/react-framework";
import { PlusCircleOutlined } from "@ant-design/icons";
import { Select as SelectComponent, Space } from "antd";
import { get, isArray, isString } from "lodash-es";
import { WidgetRegistry } from "../../registry";
import { useEnsembleAction } from "../../runtime/hooks/useEnsembleAction";
import type {
  EnsembleWidgetProps,
  EnsembleWidgetStyles,
} from "../../shared/types";
import { EnsembleRuntime } from "../../runtime";
import { getComponentStyles } from "../../shared/styles";
import type { HasBorder } from "../../shared/hasSchema";
import type { SelectOption } from "./Dropdown";
import type { FormInputProps } from "./types";
import { EnsembleFormItem } from "./FormItem";

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

export type MultiSelectProps = {
  data: Expression<SelectOption[]>;
  labelKey?: string;
  valueKey?: string;
  items?: Expression<SelectOption[]>;
  onItemSelect?: EnsembleAction;
  hintStyle?: EnsembleWidgetStyles;
} & EnsembleWidgetProps<MultiSelectStyles> &
  FormInputProps<string[]>;

const MultiSelect: React.FC<MultiSelectProps> = (props) => {
  const { data, ...rest } = props;
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [newOption, setNewOption] = useState("");
  const [selectedValues, setSelectedValues] = useState<string[] | undefined>(
    isString(props.value) ? [props.value] : props.value,
  );

  const action = useEnsembleAction(props.onItemSelect);
  const { rawData } = useTemplateData({ data });
  const { id, rootRef, values } = useRegisterBindings(
    { ...rest, selectedValues, options },
    props.id,
    {
      setSelectedValues,
      setOptions,
    },
  );

  useEffect(() => {
    if (
      values?.items &&
      isArray(values.items) &&
      values.items.every(
        (item) =>
          !values.options.some(
            (option) => option.value === item.value.toString(),
          ),
      )
    ) {
      setOptions([
        ...values.options,
        ...values.items.map((item) => ({
          label: item.label,
          value: item.value,
        })),
      ]);
    }
  }, [values?.items]);

  useEffect(() => {
    const tempOptions: SelectOption[] = [];
    if (isArray(rawData)) {
      tempOptions.push(
        ...rawData.map((item) => ({
          label: get(item, values?.labelKey || "label") as string,
          value: get(item, values?.valueKey || "value") as string,
        })),
      );
    }

    setOptions(tempOptions);
  }, [rawData, values?.labelKey, values?.valueKey]);

  const handleChange = (value: string[]): void => {
    setSelectedValues(value);
    onItemSelectCallback(value);
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

  const handleSearch = (value: string): void => {
    if (
      values?.options.some((option) =>
        option.label.toString().toLowerCase().startsWith(value.toLowerCase()),
      )
    )
      setNewOption("");
    else {
      setNewOption(value);
    }
  };

  const onItemSelectCallback = useCallback(
    (value?: string[]) => {
      if (action) {
        action.callback({ selectedValues: value });
      }
    },
    [action],
  );

  const defaultValue = useMemo(() => {
    if (isArray(values?.value)) {
      return values?.value;
    }
    if (isString(values?.value)) {
      return [values?.value || ""];
    }
  }, [values?.value]);

  const renderOptions = useMemo(
    () =>
      options.map((option) => (
        <SelectComponent.Option
          className={`${id || ""}_option`}
          key={option.value}
          value={option.value}
        >
          {isString(option.label)
            ? option.label
            : EnsembleRuntime.render([unwrapWidget(option.label)])}
        </SelectComponent.Option>
      )),
    [options, id],
  );

  const newOptionRender = (menu: ReactElement): ReactElement => (
    <Dropdown menu={menu} newOption={newOption} />
  );

  return (
    <>
      <style>{`
        .${id}_input .ant-select-selector {
          ${getComponentStyles("multiSelect", values?.styles)}
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
            disabled={
              values?.enabled === undefined ? false : Boolean(values.enabled)
            }
            dropdownRender={newOptionRender}
            dropdownStyle={values?.styles}
            filterOption={(input, option): boolean =>
              option?.label
                ?.toString()
                ?.toLowerCase()
                ?.startsWith(input.toLowerCase()) || false
            }
            id={values?.id}
            mode="tags"
            notFoundContent="No Results"
            onChange={handleChange}
            onSearch={handleSearch}
            placeholder={
              values?.hintText ? (
                <span style={{ ...values.hintStyle }}>{values.hintText}</span>
              ) : (
                ""
              )
            }
            value={values?.selectedValues}
          >
            {renderOptions}
          </SelectComponent>
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

WidgetRegistry.register("MultiSelect", MultiSelect);
