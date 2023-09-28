import { DatePicker } from "antd";
import { WidgetRegistry } from "../registry";
import dayjs from 'dayjs';
import { DateProps } from "./Date";

const { RangePicker } = DatePicker;

export const DateRange: React.FC<DateProps> = ({
  format = 'YYYY/MM/DD',
  styles
}) => {

  return <RangePicker
    style={styles}
    format={format} />;
};

WidgetRegistry.register("DateRange", DateRange);
