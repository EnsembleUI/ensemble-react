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

export type DateProps = {
  initialValue?: Expression<string>;
  firstDate?: Expression<string>;
  lastDate?: Expression<string>;
  showCalendarIcon?: boolean;
  onChange?: EnsembleAction;
} & FormInputProps<string> &
  EnsembleWidgetProps;

export const Date: React.FC<DateProps> = (props) => {
  const [value, setValue] = useState<string>();
  const action = useEnsembleAction(props.onChange);

  const { id, values } = useRegisterBindings(
    { ...props, initialValue: props.value, value, widgetName },
    props.id,
    {
      setValue,
    },
  );

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
    const formattedDate = dayjs(date).format(DateDisplayFormat);
    if (formattedDate === "Invalid Date") {
      onChangeCallback("");
    } else {
      onChangeCallback(formattedDate);
    }
  };

  useEffect(() => {
    if (!value && !values?.value) {
      setValue(
        values?.initialValue ? String(dayjs(values.initialValue)) : undefined,
      );
    } else if (values?.value) {
      setValue(values.value);
    }
  }, [values]);

  const formInstance = Form.useFormInstance();

  useEffect(() => {
    if (formInstance) {
      formInstance.setFieldsValue({
        [values?.id ?? values?.label ?? ""]: value ? dayjs(value) : undefined,
      });
    }
  }, [value, formInstance]);

  return (
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
  );
};

WidgetRegistry.register(widgetName, Date);
