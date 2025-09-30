import { Select, Form, Space } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CustomScopeProvider,
  evaluate,
  useRegisterBindings,
  useTemplateData,
  defaultScreenContext,
  unwrapWidget,
} from "@ensembleui/react-framework";
import type {
  CustomScope,
  EnsembleAction,
  Expression,
} from "@ensembleui/react-framework";
import { get, isEmpty, isNull, isObject, isString } from "lodash-es";
import { WidgetRegistry } from "../../registry";
import type {
  EnsembleWidgetProps,
  EnsembleWidgetStyles,
  HasItemTemplate,
} from "../../shared/types";
import { useEnsembleAction } from "../../runtime/hooks/useEnsembleAction";
import { EnsembleRuntime } from "../../runtime";
import { getComponentStyles } from "../../shared/styles";
import type { HasBorder } from "../../shared/hasSchema";
import type { FormInputProps } from "./types";
import { EnsembleFormItem } from "./FormItem";
import { updateFieldValue } from "./Form";

const widgetName = "Dropdown";

export type DropdownStyles = {
  dropdownBackgroundColor?: string;
  dropdownBorderRadius?: number;
  dropdownBorderColor?: string;
  dropdownBorderWidth?: number;
  dropdownMaxHeight?: string;
  selectedBackgroundColor?: string;
  selectedTextColor?: string;
} & HasBorder &
  EnsembleWidgetStyles;

export interface SelectOption {
  label: Expression<string> | { [key: string]: unknown };
  value: Expression<string | number>;
  type?: string;
  items?: SelectOption[];
}

export type DropdownProps = {
  allowClear?: boolean;
  items?: SelectOption[];
  /* deprecated, use onChange */
  onItemSelect: EnsembleAction;
  onChange?: EnsembleAction;
  autoComplete: Expression<boolean>;
  hintStyle?: EnsembleWidgetStyles;
  panel?: { [key: string]: unknown };
  allowCreateOptions?: boolean;
} & EnsembleWidgetProps<DropdownStyles> &
  HasItemTemplate & {
    "item-template"?: { value: Expression<string> };
  } & FormInputProps<string | number>;

const DropdownRenderer = (
  menu: React.ReactElement,
  panel?: { [key: string]: unknown },
  newOption?: string,
  onAddNewOption?: (value: string) => void,
): React.ReactElement => {
  const panelOption = useMemo(() => {
    return panel ? EnsembleRuntime.render([unwrapWidget(panel)]) : null;
  }, []);

  // if we have a new option to add, show custom content along with the menu
  if (newOption) {
    return (
      <>
        <div style={{ padding: "10px 15px" }}>
          <span>There are no matches</span>
        </div>
        <Space
          style={{
            padding: "10px 15px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            width: "100%",
            cursor: "pointer",
          }}
          onClick={() => onAddNewOption?.(newOption)}
        >
          <Space>
            <PlusCircleOutlined />
            <span>{`Add "${newOption}"`}</span>
          </Space>
        </Space>
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
        <div
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {panelOption}
        </div>
      </>
    );
  }

  return (
    <>
      {menu}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {panelOption}
      </div>
    </>
  );
};

const Dropdown: React.FC<DropdownProps> = (props) => {
  const [selectedValue, setSelectedValue] = useState<
    string | number | undefined
  >();
  const [newOption, setNewOption] = useState("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [items, setItems] = useState<SelectOption[]>([]);
  const initializedRef = useRef(false);
  const {
    "item-template": itemTemplate,
    onChange,
    onItemSelect,
    ...rest
  } = props;

  const handleDropdownClose = useCallback((): void => {
    setIsOpen(false);
  }, []);

  const { id, rootRef, values } = useRegisterBindings(
    {
      ...rest,
      isOpen,
      initialValue: props.value,
      value: selectedValue,
      selectedValue,
      widgetName,
    },
    props.id,
    {
      setSelectedValue,
      close: handleDropdownClose,
      setValue: setSelectedValue,
    },
  );

  const onChangeAction = useEnsembleAction(onChange);
  const handleChange = useCallback(
    (value?: number | string) => {
      setSelectedValue(value);
      onChangeAction?.callback({ value });

      // if the selected value is a new option that doesn't exist in items, add it
      if (value && values?.allowCreateOptions) {
        const optionExists = items.find((item) => item.value === value);
        if (!optionExists) {
          const newItem: SelectOption = {
            label: value.toString(),
            value: value,
          };
          setItems((prevItems) => [...prevItems, newItem]);
        }
      }
      setNewOption("");
    },
    [onChangeAction?.callback, values?.allowCreateOptions, items],
  );

  const onItemSelectAction = useEnsembleAction(onItemSelect);
  const onItemSelectCallback = useCallback(
    (value?: number | string) => {
      setSelectedValue(value);
      onItemSelectAction?.callback({ selectedValue: value });
    },
    [onItemSelectAction?.callback],
  );

  const handleSearch = (value: string): void => {
    if (!values?.allowCreateOptions) {
      return;
    }

    const isOptionExist = items.find((option) =>
      option.label.toString().toLowerCase().includes(value.toLowerCase()),
    );

    if (!isOptionExist && value.trim()) {
      setNewOption(value);
    } else {
      setNewOption("");
    }
  };

  const handleAddNewOption = useCallback(
    (value: string) => {
      const newItem: SelectOption = {
        label: value,
        value: value,
      };
      setItems((prevItems) => [...prevItems, newItem]);

      setSelectedValue(value);
      onChangeAction?.callback({ value });

      // trigger form's onChange action
      updateFieldValue(formInstance, values?.id ?? values?.label ?? "", value);

      setNewOption("");
      setIsOpen(false);
    },
    [onChangeAction?.callback],
  );

  const { namedData } = useTemplateData({
    data: itemTemplate?.data,
    name: itemTemplate?.name,
  });

  // initialize items from props only once
  useEffect(() => {
    if (values?.items && !initializedRef.current) {
      setItems(values.items);
      initializedRef.current = true;
    }
  }, [values?.items]);

  const options = useMemo(() => {
    let dropdownOptions: React.ReactNode[] | null = null;

    if (items.length > 0) {
      const tempOptions = items.map((item) => {
        if (item.type === "group") {
          // Render a group item with sub-items
          return (
            <Select.OptGroup
              key={item.value}
              label={isString(item.label) ? item.label : ""}
            >
              {item.items?.map((subItem) => (
                <Select.Option key={subItem.value}>
                  {isString(item.label)
                    ? item.label
                    : EnsembleRuntime.render([unwrapWidget(item.label)])}
                </Select.Option>
              ))}
            </Select.OptGroup>
          );
        }
        return (
          <Select.Option
            className={`${values?.id || ""}_option`}
            key={item.value}
            value={item.value}
          >
            {isString(item.label)
              ? item.label
              : EnsembleRuntime.render([unwrapWidget(item.label)])}
          </Select.Option>
        );
      });

      dropdownOptions = tempOptions;
    }

    if (isObject(itemTemplate) && !isEmpty(namedData)) {
      const tempOptions = namedData.map((item: unknown) => {
        const value = evaluate<string | number>(
          defaultScreenContext,
          itemTemplate.value,
          {
            [itemTemplate.name]: get(item, itemTemplate.name) as unknown,
          },
        );
        return (
          <Select.Option
            className={`${values?.id || ""}_option`}
            key={value}
            value={value}
          >
            <CustomScopeProvider value={item as CustomScope}>
              {EnsembleRuntime.render([itemTemplate.template])}
            </CustomScopeProvider>
          </Select.Option>
        );
      });

      dropdownOptions = [...(dropdownOptions || []), ...tempOptions];
    }

    return dropdownOptions;
  }, [items, namedData, itemTemplate]);

  const { backgroundColor: _, ...formItemStyles } = values?.styles ?? {};

  const formInstance = Form.useFormInstance();

  useEffect(() => {
    setSelectedValue(values?.initialValue);
  }, [values?.initialValue]);

  useEffect(() => {
    if (formInstance) {
      formInstance.setFieldsValue({
        [values?.id ?? values?.label ?? ""]: selectedValue,
      });
    }
  }, [selectedValue, formInstance]);

  if (isNull(options) && isNull(values?.panel)) {
    return null;
  }

  return (
    <>
      <style>{`
        .ant-select-single {
          min-height: 32px !important;
          height: unset !important;
        }
        .${id}_input .ant-select-selector {
          ${getComponentStyles("dropdown", values?.styles, true, true) as string}
        }
        .ant-select-item.ant-select-item-option.${id}_option[aria-selected="true"] {
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
          #${id}_list.ant-select-item-empty {
          ${!isEmpty(values?.panel) ? "display: none;" : ""}
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
      <div ref={rootRef} style={{ flex: 1, ...formItemStyles }}>
        <EnsembleFormItem values={values}>
          <Select
            key={`${id}-${items.length}`}
            allowClear={values?.allowClear ?? true}
            className={`${values?.styles?.names || ""} ${id}_input`}
            defaultValue={values?.value}
            disabled={values?.enabled === false}
            dropdownRender={(menu): React.ReactElement =>
              DropdownRenderer(
                menu,
                values?.panel,
                newOption,
                handleAddNewOption,
              )
            }
            dropdownStyle={values?.styles}
            id={values?.id}
            onChange={handleChange}
            onDropdownVisibleChange={(state): void => setIsOpen(state)}
            onSearch={values?.allowCreateOptions ? handleSearch : undefined}
            onSelect={onItemSelectCallback}
            open={isOpen}
            placeholder={
              values?.hintText ? (
                <span style={{ ...values.hintStyle }}>{values.hintText}</span>
              ) : (
                ""
              )
            }
            optionFilterProp="children"
            showSearch={
              Boolean(values?.autoComplete) ||
              Boolean(values?.allowCreateOptions)
            }
            value={values?.selectedValue}
          >
            {options}
          </Select>
        </EnsembleFormItem>
      </div>
    </>
  );
};

WidgetRegistry.register(widgetName, Dropdown);
