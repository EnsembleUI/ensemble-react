import {
  type EnsembleAction,
  useRegisterBindings,
} from "@ensembleui/react-framework";
import { Form as AntForm } from "antd";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useState, useCallback } from "react";
import dayjs from "dayjs";
import { WidgetRegistry } from "../../registry";
import type { EnsembleWidgetProps } from "../../shared/types";
import { useEnsembleAction } from "../../runtime/hooks/useEnsembleAction";
import type { FormInputProps } from "../Form/types";
import { CalendarHeader } from "./CalendarHeader";
import { ActionBar } from "./ActionBar";
import { DateDisplayFormat } from "./utils/DateConstants";
import { DatePickerContext } from "./utils/DatePickerContext";

type DateProps = {
  initialValue?: string;
  firstDate?: string;
  lastDate?: string;
  showCalendarIcon?: boolean;
  onChange?: EnsembleAction;
} & EnsembleWidgetProps &
  FormInputProps<string>;

export const Date: React.FC<DateProps> = (props) => {
  const [value, setValue] = useState<dayjs.Dayjs | undefined>(
    props.initialValue ? dayjs(props.initialValue) : undefined,
  );
  const [openPicker, setOpenPicker] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [enteredDate, setEnteredDate] = useState("");
  const [errorText, setErrorText] = useState("");
  const action = useEnsembleAction(props.onChange);

  const { values } = useRegisterBindings({ ...props, value }, props.id, {
    setValue,
  });

  const onChangeCallback = useCallback(
    (date: string) => {
      if (!action) {
        return;
      }
      action.callback({
        [props?.id as string]: {
          value: date,
          setValue,
          ...props,
        },
      });
    },
    [action, props],
  );

  const onDateChange = (date: unknown): void => {
    const formattedDate = dayjs(date as string)?.format(DateDisplayFormat);
    formattedDate !== "Invalid Date" && setEnteredDate(formattedDate);

    onChangeCallback(formattedDate);
  };

  const onDateAccept = (date: unknown): void => {
    setValue(dayjs(date as string));
    setOpenPicker(false);
  };

  return (
    <DatePickerContext.Provider
      value={{
        firstDate: props?.firstDate,
        lastDate: props?.lastDate,
        value,
        setValue,
        isCalendarOpen,
        setIsCalendarOpen,
        enteredDate,
        setEnteredDate,
        errorText,
        setErrorText,
      }}
    >
      <AntForm.Item
        label={values?.label}
        name={props.id ? values?.id : values?.label}
        rules={[{ required: values?.required }]}
        style={{
          marginBottom: "0px",
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label={value ? "" : props?.hintText || "Select a date"}
            value={value ? dayjs(value) : ""}
            disabled={props?.enabled === false}
            closeOnSelect={false}
            open={openPicker}
            maxDate={props.lastDate ? dayjs(props.lastDate) : undefined}
            minDate={props.firstDate ? dayjs(props.firstDate) : undefined}
            onClose={(): void => setOpenPicker(false)}
            onAccept={onDateAccept}
            onChange={onDateChange}
            slots={{
              calendarHeader: CalendarHeader,
              actionBar: ActionBar,
            }}
            slotProps={{
              actionBar: {
                actions: ["cancel", "accept"],
              },
              field: {
                clearable: Boolean(value),
                onClear: () => setValue(undefined),
              },
              textField: {
                InputLabelProps: {
                  shrink: false,
                },
                onClick:
                  props?.enabled === false
                    ? undefined
                    : () => setOpenPicker(true),
                error: false,
                color: "success",
              },
              popper: {
                modifiers: [
                  {
                    name: "flip",
                    enabled: false,
                  },
                ],
              },
              layout: {
                sx: {
                  "& .MuiDateCalendar-root": {
                    overflow: "visible !important",
                    height: "unset !important",
                    maxHeight: "unset !important",
                    backgroundColor: "rgb(239, 223, 240)",
                  },
                  "& .MuiPickersFadeTransitionGroup-root.MuiDateCalendar-viewTransitionContainer":
                    {
                      display: `${
                        isCalendarOpen ? "block" : "none"
                      } !important`,
                    },
                },
              },
            }}
            sx={{
              "& .MuiOutlinedInput-notchedOutline": {
                top: "0px",
              },
              "& .MuiOutlinedInput-notchedOutline legend": {
                display: "none",
              },
              "& .MuiInputBase-input.MuiOutlinedInput-input.MuiInputBase-inputAdornedEnd":
                {
                  visibility: `${!value ? "hidden" : "visible"} !important`,
                },
              "& .MuiDateCalendar-root": {
                backgroundColor: "rgb(239, 223, 240)",
                overflow: "visible !important",
                height: "unset !important",
                maxHeight: "unset !important",
              },
              "& .MuiPickersFadeTransitionGroup-root.MuiDateCalendar-viewTransitionContainer":
                {
                  display: "none !important",
                },
            }}
          />
        </LocalizationProvider>
      </AntForm.Item>
    </DatePickerContext.Provider>
  );
};

WidgetRegistry.register("Date", Date);
