import { error, useRegisterBindings } from "@ensembleui/react-framework";
import type { Expression, EnsembleAction } from "@ensembleui/react-framework";
import { DatePicker, Form } from "antd";
import { useState, useCallback, useEffect } from "react";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import localeData from "dayjs/plugin/localeData";
import weekday from "dayjs/plugin/weekday";
import weekOfYear from "dayjs/plugin/weekOfYear";
import weekYear from "dayjs/plugin/weekYear";
import { isArray } from "lodash-es";
import { WidgetRegistry } from "../../../registry";
import type { EnsembleWidgetProps } from "../../../shared/types";
import { useEnsembleAction } from "../../../runtime/hooks/useEnsembleAction";
import type { FormInputProps } from "../types";
import { EnsembleFormItem } from "../FormItem";
import { DateDisplayFormat } from "./utils/DateConstants";

/* eslint-disable import/no-named-as-default-member */
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(weekOfYear);
dayjs.extend(weekYear);
/* eslint-enable import/no-named-as-default-member */

const widgetName = "Date";

const standardizeTimestamp = (timestamp: string, format?: string): string =>
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

  const { id, values, rootRef } = useRegisterBindings(
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
  }, [values?.format, values?.initialValue]);

  const onChangeCallback = useCallback(
    (date?: string) => {
      action?.callback({
        [id]: {
          value: date,
          setValue,
          ...props,
        },
      });
    },
    [action?.callback, id, props],
  );

  const onDateChange = (date: Dayjs, dateString: string | string[]): void => {
    if (isArray(dateString)) {
      error("Received an array of dates when only expecting one");
      return;
    }
    setValue(dateString);
    const formattedDate = standardizeTimestamp(dateString, values?.format);
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
  }, [value, formInstance, values?.id, values?.label]);

  return (
    <EnsembleFormItem
      initialValue={values?.initialValue ? dayjs(values.initialValue) : null}
      values={values}
    >
      <DatePicker
        disabled={values?.enabled === false}
        disabledDate={(d): boolean =>
          (Boolean(values?.lastDate) && d.isAfter(values?.lastDate)) ||
          (Boolean(values?.firstDate) && d.isBefore(values?.firstDate))
        }
        format={values?.format}
        onChange={onDateChange}
        placeholder={values?.hintText}
        ref={rootRef}
        style={{ width: "100%", ...values?.styles }}
        value={values?.value ? dayjs(values.value) : null}
        {...(values?.showCalendarIcon === false
          ? { suffixIcon: false }
          : undefined)}
      />
    </EnsembleFormItem>
  );
};

WidgetRegistry.register(widgetName, Date);
