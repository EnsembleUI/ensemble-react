import { useMemo } from "react";
import { DatePicker } from "antd";
import { get } from "lodash-es";
import { WidgetRegistry } from "../registry";
import { EnsembleRuntime } from "../runtime";
import type { EnsembleWidgetProps, FlexboxProps } from "../util/types";
import { getColor, getCrossAxis, getMainAxis } from "../util/utils";
import { Expression } from "framework";
import dayjs from 'dayjs';

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

export const Date: React.FC<DateProps> = ({
  value,
  minDate,
  minDateFormat,
  maxDate,
  maxDateFormat,
  format = 'YYYY/MM/DD',
  styles
}) => {
  const disableDate = (current: dayjs.Dayjs) => {
    if (minDate && maxDate) {
      return !(dayjs(minDate, minDateFormat).isBefore(current) && dayjs(maxDate, maxDateFormat).isAfter(current))
    }
    if (minDate) {
      return dayjs(minDate, minDateFormat).isAfter(current)
    }
    if (maxDate) {
      return dayjs(maxDate, maxDateFormat).isBefore(current)
    }
    return false
  }

  return <DatePicker
    defaultValue={dayjs(value)}
    format={format}
    style={styles}
    disabledDate={(current) => disableDate(current)}
  />;
};

WidgetRegistry.register("Date", Date);
