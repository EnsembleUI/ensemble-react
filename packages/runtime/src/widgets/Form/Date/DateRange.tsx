import { useCallback, useState } from "react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import {
  type Expression,
  useRegisterBindings,
  type EnsembleAction,
} from "@ensembleui/react-framework";
import { WidgetRegistry } from "../../../registry";
import { EnsembleFormItem } from "../FormItem";
import { type FormInputProps } from "../types";
import { type EnsembleWidgetProps } from "../../../shared/types";
import { useEnsembleAction } from "../../../runtime/hooks/useEnsembleAction";
import { DateDisplayFormat } from "./utils/DateConstants";

interface ShowTimeProps {
  hideDisabledOptions: boolean;
}

type DateRangeProps = {
  fromDate?: Expression<string>;
  toDate?: Expression<string>;
  fromHintText?: Expression<string>;
  toHintText?: Expression<string>;
  onChange?: EnsembleAction;
  showCalendarIcon?: boolean;
  showTime?: ShowTimeProps | boolean;
} & FormInputProps<string> &
  EnsembleWidgetProps;

export const DateRange: React.FC<DateRangeProps> = (props) => {
  const { RangePicker } = DatePicker;

  const [fromValue, setFromValue] = useState(props.fromDate);
  const [toValue, setToValue] = useState(props.toDate);
  const { id, values } = useRegisterBindings(
    { ...props, fromValue, toValue },
    props.id,
    {
      setFromValue,
      setToValue,
    },
  );
  const onChangeAction = useEnsembleAction(props.onChange);

  const onChangeActionCallback = useCallback(
    (data?: string[]) => {
      if (!onChangeAction) {
        return;
      }

      onChangeAction.callback({
        [id]: {
          value: data,
          setFromValue,
          setToValue,
        },
      });
    },
    [onChangeAction, id],
  );

  const onDateRangeChange = (_: unknown, datesString: unknown): void => {
    const selectedDates = datesString as string[];
    const formattedStartDate = dayjs(selectedDates[0]).format(
      DateDisplayFormat,
    );
    const formattedEndDate = dayjs(selectedDates[1]).format(DateDisplayFormat);

    onChangeActionCallback([formattedStartDate, formattedEndDate]);
  };

  return (
    <EnsembleFormItem initialValue={undefined} values={values}>
      <RangePicker
        defaultValue={[
          values?.fromDate ? dayjs(values.fromDate) : null,
          values?.toDate ? dayjs(values.toDate) : null,
        ]}
        disabled={values?.enabled === false}
        onChange={onDateRangeChange}
        placeholder={[
          values?.fromHintText ? values.fromHintText : "Start date",
          values?.toHintText ? values.toHintText : "End date",
        ]}
        showTime={values?.showTime}
        style={{ width: "100%", ...values?.styles }}
        value={[dayjs(values?.fromValue), dayjs(values?.toValue)]}
        {...(values?.showCalendarIcon === false
          ? { suffixIcon: false }
          : undefined)}
      />
    </EnsembleFormItem>
  );
};

WidgetRegistry.register("DateRange", DateRange);
