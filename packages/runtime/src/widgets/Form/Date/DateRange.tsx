import { ReactNode, useCallback, useState } from "react";
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
import type { IconProps, EnsembleWidgetProps } from "../../../shared/types";
import { useEnsembleAction } from "../../../runtime/hooks/useEnsembleAction";
import { Icon } from "../../Icon";
import { DateDisplayFormat } from "./utils/DateConstants";

const widgetName = "DateRange";

interface ShowTimeProps {
  hideDisabledOptions: boolean;
}

type DateRangeProps = {
  fromDate?: Expression<string>;
  toDate?: Expression<string>;
  onChange?: EnsembleAction;
  showCalendarIcon?: boolean;
  showTime?: ShowTimeProps | boolean;
  suffixIcon?: IconProps;
} & FormInputProps<string> &
  EnsembleWidgetProps;

export const DateRange: React.FC<DateRangeProps> = (props) => {
  const { RangePicker } = DatePicker;

  const [fromValue, setFromValue] = useState(props.fromDate);
  const [toValue, setToValue] = useState(props.toDate);
  const { id, values } = useRegisterBindings(
    { ...props, fromValue, toValue, widgetName },
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

  // tweak the collapsible icons
  const suffixIcon = () => {
    if (values?.showCalendarIcon === false) {
      return false;
    }

    if (values?.suffixIcon) {
      return (<Icon {...values.suffixIcon} />) as ReactNode;
    }

    return false;
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
        placeholder={[values?.hintText ? values.hintText : "Start date", ""]}
        showTime={values?.showTime}
        suffixIcon={suffixIcon()}
        style={{ width: "100%", ...values?.styles }}
        value={[dayjs(values?.fromValue), dayjs(values?.toValue)]}
      />
    </EnsembleFormItem>
  );
};

WidgetRegistry.register(widgetName, DateRange);
