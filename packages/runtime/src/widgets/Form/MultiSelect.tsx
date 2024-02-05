import type { ReactElement } from "react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { Expression, EnsembleAction } from "@ensembleui/react-framework";
import {
  useRegisterBindings,
  useTemplateData,
} from "@ensembleui/react-framework";
import { PlusCircleOutlined } from "@ant-design/icons";
import { Select as SelectComponent, Space } from "antd";
import { get, isArray, isString } from "lodash-es";
import { WidgetRegistry } from "../../registry";
import { getColor } from "../../shared/styles";
import { useEnsembleAction } from "../../runtime/hooks/useEnsembleAction";
import { EnsembleFormItem } from "./FormItem";
import type { FormInputProps } from "./types";
import type { SelectOption } from "./Dropdown";
import type {
  EnsembleWidgetProps,
  EnsembleWidgetStyles,
} from "../../shared/types";

export type MultiSelectProps = {
  data: Expression<SelectOption[]>;
  labelKey?: string;
  valueKey?: string;
  items?: Expression<SelectOption[]>;
  onItemSelect?: EnsembleAction;
  hintStyle?: EnsembleWidgetStyles;
} & EnsembleWidgetProps &
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
  const { rootRef, values } = useRegisterBindings(
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
      isArray(values?.items) &&
      values?.items.every(
        (item) =>
          !values?.options.some(
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
      values?.options.some(
        (option) =>
          option.label
            ?.toString()
            ?.toLowerCase()
            ?.startsWith(value.toLowerCase()),
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
    return;
  }, [values?.value]);

  return (
    <div ref={rootRef}>
      <EnsembleFormItem values={values}>
        <SelectComponent
          id={values?.id}
          allowClear
          defaultValue={defaultValue}
          // eslint-disable-next-line react/no-unstable-nested-components
          dropdownRender={(menu): ReactElement => (
            <Dropdown menu={menu} newOption={newOption} />
          )}
          filterOption={(input, option): boolean =>
            option?.label
              ?.toString()
              ?.toLowerCase()
              ?.startsWith(input.toLowerCase()) || false
          }
          mode="tags"
          notFoundContent="No Results"
          onChange={handleChange}
          onSearch={handleSearch}
          options={values?.options}
          placeholder={
            values?.hintText ? (
              <span style={{ ...values.hintStyle }}>{values.hintText}</span>
            ) : (
              ""
            )
          }
          style={{
            width: values?.styles?.width ?? "100%",
            margin: values?.styles?.margin,
            borderRadius: values?.styles?.borderRadius,
            borderWidth: values?.styles?.borderWidth,
            borderStyle: values?.styles?.borderStyle,
            borderColor: values?.styles?.borderColor
              ? getColor(values?.styles.borderColor)
              : undefined,
            ...values?.styles,
          }}
          value={values?.selectedValues}
        />
      </EnsembleFormItem>
    </div>
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
