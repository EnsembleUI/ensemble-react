import { useRegisterBindings } from "@ensembleui/react-framework";
import type { Expression, EnsembleAction } from "@ensembleui/react-framework";
import { DatePicker, Form } from "antd";
import { useState, useCallback, useEffect } from "react";
import dayjs from "dayjs";
import { WidgetRegistry } from "../../../registry";
import type { EnsembleWidgetProps } from "../../../shared/types";
import { useEnsembleAction } from "../../../runtime/hooks/useEnsembleAction";
import type { FormInputProps } from "../types";
import { EnsembleFormItem } from "../FormItem";
import { DateDisplayFormat } from "./utils/DateConstants";

const widgetName = "Date";

const standardizeTimestamp = (timestamp: string, format?: string) =>
  dayjs(timestamp).format(format || DateDisplayFormat);

export type DateProps = {
  initialValue?: Expression<string>;
  firstDate?: Expression<string>;
  lastDate?: Expression<string>;
  showCalendarIcon?: boolean;
  onChange?: EnsembleAction;
  format?: string;
} & FormInputProps<string> &
  EnsembleWidgetProps;

export const Date: React.FC<DateProps> = (props) => {
  const [value, setValue] = useState<string>();
  const action = useEnsembleAction(props.onChange);

  const { id, values } = useRegisterBindings(
    {
      ...props,
      initialValue: props.initialValue ?? props.value,
      value,
      widgetName,
    },
    props.id,
    {
      setValue,
    },
  );

  useEffect(() => {
    if (values?.initialValue) {
      setValue(standardizeTimestamp(values.initialValue, values.format));
    }
  }, [values?.initialValue]);

  const onChangeCallback = useCallback(
    (date?: string) => {
      if (!action) {
        return;
      }
      action.callback({
        [id]: {
          value: date,
          setValue,
          ...props,
        },
      });
    },
    [action, id, props],
  );

  const onDateChange = (date: string): void => {
    setValue(date);
    const formattedDate = standardizeTimestamp(date, values?.format);
    if (formattedDate === "Invalid Date") {
      onChangeCallback("");
    } else {
      onChangeCallback(formattedDate);
    }
  };

  const formInstance = Form.useFormInstance();

  useEffect(() => {
    if (formInstance) {
      formInstance.setFieldsValue({
        [values?.id ?? values?.label ?? ""]: value ? dayjs(value) : undefined,
      });
    }
  }, [value, formInstance]);

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div onClick={(e) => e.stopPropagation()}>
        <EnsembleFormItem
          initialValue={
            values?.initialValue ? dayjs(values.initialValue) : undefined
          }
          values={values}
        >
          <DatePicker
            disabled={values?.enabled === false}
            disabledDate={(d): boolean =>
              (Boolean(values?.lastDate) && d.isAfter(values?.lastDate)) ||
              (Boolean(values?.firstDate) && d.isBefore(values?.firstDate))
            }
            onChange={onDateChange}
            placeholder={values?.hintText}
            style={{ width: "100%", ...values?.styles }}
            value={String(dayjs(values?.value))}
            {...(values?.showCalendarIcon === false
              ? { suffixIcon: false }
              : undefined)}
          />
        </EnsembleFormItem>
      </div>
    </>
  );
};

WidgetRegistry.register(widgetName, Date);
