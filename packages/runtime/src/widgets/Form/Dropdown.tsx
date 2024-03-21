import { Select } from "antd";
import { useCallback, useMemo, useState } from "react";
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
  items?: SelectOption[];
  onItemSelect: EnsembleAction;
  autoComplete: Expression<boolean>;
  hintStyle?: EnsembleWidgetStyles;
} & EnsembleWidgetProps<DropdownStyles> &
  HasItemTemplate & {
    "item-template"?: { value: Expression<string> };
  } & FormInputProps<string | number>;

const Dropdown: React.FC<DropdownProps> = (props) => {
  const [selectedValue, setSelectedValue] = useState(props.value);
  const { "item-template": itemTemplate, ...rest } = props;
  const { id, rootRef, values } = useRegisterBindings(
    { ...rest, selectedValue },
    props.id,
    {
      setSelectedValue,
    },
  );

  const action = useEnsembleAction(props.onItemSelect);
  const onItemSelectCallback = useCallback(
    (value?: number | string) => {
      setSelectedValue(value);
      if (action) {
        action.callback({ selectedValue: value });
      }
    },
    [action],
  );

  const { namedData } = useTemplateData({
    data: itemTemplate?.data,
    name: itemTemplate?.name,
  });

  const options = useMemo(() => {
    let dropdownOptions = null;
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
                <Select.Option
                  key={subItem.value}
                  onClick={() => onItemSelectCallback(subItem.value)}
                >
                  {isString(subItem.label)
                    ? subItem.label
                    : EnsembleRuntime.render([unwrapWidget(subItem.label)])}
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

  if (isNull(options)) {
    return null;
  }

  return (
    <>
      <style>{`
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
            className={`${values?.styles?.names || ""} ${id}_input`}
            defaultValue={values?.value}
            disabled={
              values?.enabled === undefined ? false : Boolean(values.enabled)
            }
            dropdownStyle={values?.styles}
            id={values?.id}
            onSelect={onItemSelectCallback}
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

WidgetRegistry.register("Dropdown", Dropdown);
