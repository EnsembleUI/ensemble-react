import { Form as AntForm, Select } from "antd";
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
import { get, isEmpty, isObject, isString } from "lodash-es";
import { WidgetRegistry } from "../registry";
import type {
  EnsembleWidgetProps,
  EnsembleWidgetStyles,
  HasBorder,
  HasItemTemplate,
} from "../shared/types";
import { useEnsembleAction } from "../runtime/hooks/useEnsembleAction";
import { EnsembleRuntime } from "../runtime";

export type DropdownStyles = {
  visible?: boolean;
  dropdownBackgroundColor?: string;
  dropdownBorderRadius?: number;
  dropdownBorderColor?: string;
  dropdownBorderWidth?: number;
  dropdownMaxHeight?: string;
  selectedBackgroundColor?: string;
  selectedTextColor?: string;
} & HasBorder &
  EnsembleWidgetStyles;

export type DropdownProps = {
  label?: string;
  hintText?: string;
  value?: Expression<string | number>;
  items?: SelectOption[];
  onItemSelect: EnsembleAction;
  autoComplete: Expression<boolean>;
  labelStyle?: EnsembleWidgetStyles;
  hintStyle?: EnsembleWidgetStyles;
} & EnsembleWidgetProps<DropdownStyles> &
  HasItemTemplate & { "item-template"?: { value: Expression<string> } };

interface SelectOption {
  label: Expression<string> | Record<string, unknown>;
  value: Expression<string | number>;
}

const Dropdown: React.FC<DropdownProps> = (props) => {
  const [selectedValue, setSelectedValue] = useState(props.value);
  const { "item-template": itemTemplate, ...rest } = props;
  const { rootRef, values } = useRegisterBindings(
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
    const dropdownOptions = [];
    if (values?.items) {
      const tempOptions = values.items.map((item) => {
        return (
          <Select.Option
            key={item.value}
            value={item.value}
            className={`${values?.id || ""}_option`}
          >
            {isString(item.label)
              ? item.label
              : EnsembleRuntime.render([unwrapWidget(item.label)])}
          </Select.Option>
        );
      });

      dropdownOptions.push(...tempOptions);
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
            key={value}
            value={value}
            className={`${values?.id || ""}_option`}
          >
            <CustomScopeProvider value={item as CustomScope}>
              {EnsembleRuntime.render([itemTemplate.template])}
            </CustomScopeProvider>
          </Select.Option>
        );
      });

      dropdownOptions.push(...tempOptions);
    }

    return dropdownOptions;
  }, [values?.items, namedData, itemTemplate]);

  return (
    <>
      <AntForm.Item
        className={values?.labelStyle?.names}
        label={values?.label}
        name={values?.id}
        style={{
          marginBottom: "0px",
          ...(values?.styles?.visible === false
            ? { display: "none" }
            : undefined),
          ...values?.labelStyle,
        }}
      >
        {values?.id ? (
          <style>{`
        .${values?.id}_input .ant-select-selector {
          ${
            values?.styles?.dropdownMaxHeight
              ? `max-height: ${values.styles.dropdownMaxHeight} !important;`
              : ""
          }
          ${
            values?.styles?.dropdownBackgroundColor
              ? `background-color: ${values.styles.dropdownBackgroundColor} !important;`
              : ""
          }
          ${
            values?.styles?.dropdownBorderRadius
              ? `border-radius: ${values.styles.dropdownBorderRadius}px !important;`
              : ""
          }
          ${
            values?.styles?.dropdownBorderColor
              ? `border-color: ${values.styles.dropdownBorderColor} !important;`
              : ""
          }
          ${
            values?.styles?.dropdownBorderWidth
              ? `border-width: ${values.styles.dropdownBorderWidth}px !important;`
              : ""
          }
        }
        .ant-select-item.ant-select-item-option.${values?.id}_option[aria-selected="true"] {
          ${
            values?.styles?.selectedBackgroundColor
              ? `background-color: ${values?.styles?.selectedBackgroundColor};`
              : ""
          }
          ${
            values?.styles?.selectedTextColor
              ? `color: ${values?.styles?.selectedTextColor};`
              : ""
          }
        }
        `}</style>
        ) : null}
        <div ref={rootRef}>
          <Select
            id={values?.id}
            onSelect={onItemSelectCallback}
            placeholder={
              values?.hintText ? (
                <span style={{ ...values?.hintStyle }}>{values.hintText}</span>
              ) : (
                ""
              )
            }
            showSearch={Boolean(values?.autoComplete)}
            value={values?.selectedValue}
            className={`${values?.styles?.names || ""} ${
              values?.id || ""
            }_input`}
            dropdownStyle={{ ...values?.styles }}
          >
            {options}
          </Select>
        </div>
      </AntForm.Item>
    </>
  );
};

WidgetRegistry.register("Dropdown", Dropdown);
