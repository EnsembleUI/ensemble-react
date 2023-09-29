import { DatePicker } from "antd";
import dayjs from "dayjs";
import type { Expression } from "framework";
import { useRegisterBindings } from "framework";
import { WidgetRegistry } from "../registry";
import type { EnsembleWidgetProps } from "../util/types";

export type DateProps = {
  value?: Expression<string>;
  format: Expression<string>;
  minDate?: Expression<string>;
  minDateFormat?: Expression<string>;
  maxDate?: Expression<string>;
  maxDateFormat?: Expression<string>;
  disabled?: Expression<boolean>;
  [key: string]: unknown;
} & EnsembleWidgetProps;

export const Date: React.FC<DateProps> = (props) => {
  const { values } = useRegisterBindings(props, props.id);

  const {
    value,
    minDate,
    minDateFormat,
    maxDate,
    maxDateFormat,
    format = "YYYY/MM/DD",
    styles,
  } = values;

  const disableDate = (current: dayjs.Dayjs): boolean => {
    if (minDate && maxDate) {
      return !(
        dayjs(minDate, minDateFormat).isBefore(current) &&
        dayjs(maxDate, maxDateFormat).isAfter(current)
      );
    }
    if (minDate) {
      return dayjs(minDate, minDateFormat).isAfter(current);
    }
    if (maxDate) {
      return dayjs(maxDate, maxDateFormat).isBefore(current);
    }
    return false;
  };

  return (
    <DatePicker
      defaultValue={dayjs(value)}
      disabledDate={(current) => disableDate(current)}
      format={format}
      style={styles}
    />
  );
};

WidgetRegistry.register("Date", Date);
