import { DatePicker } from "antd";
import { useRegisterBindings } from "framework";
import { WidgetRegistry } from "../registry";
import type { DateProps } from "./Date";

const { RangePicker } = DatePicker;

export const DateRange: React.FC<DateProps> = (props) => {
  const { values } = useRegisterBindings(props, props.id);

  const { styles, format = "YYYY/MM/DD" } = values;

  return <RangePicker format={format} style={styles} />;
};

WidgetRegistry.register("DateRange", DateRange);
