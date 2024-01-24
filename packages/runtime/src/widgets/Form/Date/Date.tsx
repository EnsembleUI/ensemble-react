import { useRegisterBindings } from "@ensembleui/react-framework";
import type { Expression, EnsembleAction } from "@ensembleui/react-framework";
import { DatePicker } from "antd";
import { useState, useCallback } from "react";
import dayjs from "dayjs";
import { WidgetRegistry } from "../../../registry";
import type {
  EnsembleWidgetProps,
  EnsembleWidgetStyles,
} from "../../../shared/types";
import { useEnsembleAction } from "../../../runtime/hooks/useEnsembleAction";
import type { FormInputProps } from "../types";
import { EnsembleFormItem } from "../FormItem";
import { DateDisplayFormat } from "./utils/DateConstants";

type DateStyles = {
  visible?: boolean;
} & EnsembleWidgetStyles;

type DateProps = {
  initialValue?: Expression<string>;
  firstDate?: Expression<string>;
  lastDate?: Expression<string>;
  showCalendarIcon?: boolean;
  onChange?: EnsembleAction;
} & FormInputProps<string> &
  EnsembleWidgetProps<DateStyles>;

export const Date: React.FC<DateProps> = (props) => {
  const [value, setValue] = useState(props.value);
  const action = useEnsembleAction(props.onChange);

  const { id, values } = useRegisterBindings({ ...props, value }, props.id, {
    setValue,
  });

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

  const onDateChange = (date: unknown): void => {
    const formattedDate = dayjs(date as string).format(DateDisplayFormat);

    if (formattedDate === "Invalid Date") {
      onChangeCallback("");
    } else {
      onChangeCallback(formattedDate);
    }
  };

  return (
    <EnsembleFormItem initialValue={undefined} values={values}>
      <DatePicker
        defaultPickerValue={
          values?.initialValue ? dayjs(values.initialValue) : undefined
        }
        disabled={values?.enabled === false}
        disabledDate={(d): boolean =>
          (Boolean(values?.lastDate) && d.isAfter(values?.lastDate)) ||
          (Boolean(values?.firstDate) && d.isBefore(values?.firstDate))
        }
        onChange={onDateChange}
        placeholder={values?.hintText}
        style={{ width: "100%", ...values?.styles }}
        value={dayjs(values?.value)}
        {...(values?.showCalendarIcon === false
          ? { suffixIcon: false }
          : undefined)}
      />
    </EnsembleFormItem>
  );
};

WidgetRegistry.register("Date", Date);
