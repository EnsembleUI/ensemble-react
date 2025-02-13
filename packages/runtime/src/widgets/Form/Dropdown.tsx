import { Select, Form } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
} & EnsembleWidgetProps<DropdownStyles> &
  HasItemTemplate & {
    "item-template"?: { value: Expression<string> };
  } & FormInputProps<string | number>;

const DropdownRenderer = (
  menu: React.ReactElement,
  panel?: { [key: string]: unknown },
): React.ReactElement => {
  const panelOption = useMemo(() => {
    return panel ? EnsembleRuntime.render([unwrapWidget(panel)]) : null;
  }, []);

  return (
    <>
      {menu}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
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

  const [isOpen, setIsOpen] = useState<boolean>(false);
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
    },
    [onChangeAction?.callback],
  );

  const onItemSelectAction = useEnsembleAction(onItemSelect);
  const onItemSelectCallback = useCallback(
    (value?: number | string) => {
      setSelectedValue(value);
      onItemSelectAction?.callback({ selectedValue: value });
    },
    [onItemSelectAction?.callback],
  );

  const { namedData } = useTemplateData({
    data: itemTemplate?.data,
    name: itemTemplate?.name,
  });

  const options = useMemo(() => {
    let dropdownOptions: React.ReactNode[] | null = null;

    if (values?.items) {
      const tempOptions = values.items.map((item) => {
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
            className={`${values.id || ""}_option`}
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
  }, [values?.items, namedData, itemTemplate]);

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
          ${getComponentStyles("dropdown", values?.styles) as string}
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
            allowClear={values?.allowClear || false}
            className={`${values?.styles?.names || ""} ${id}_input`}
            defaultValue={values?.value}
            disabled={values?.enabled === false}
            dropdownRender={(menu): React.ReactElement =>
              DropdownRenderer(menu, values?.panel)
            }
            dropdownStyle={values?.styles}
            id={values?.id}
            onChange={handleChange}
            onDropdownVisibleChange={(state): void => setIsOpen(state)}
            onSelect={onItemSelectCallback}
            open={isOpen}
            placeholder={
              values?.hintText ? (
                <span style={{ ...values.hintStyle }}>{values.hintText}</span>
              ) : (
                ""
              )
            }
            showSearch={Boolean(values?.autoComplete)}
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
