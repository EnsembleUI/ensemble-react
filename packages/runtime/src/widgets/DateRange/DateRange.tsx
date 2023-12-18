import {
  type EnsembleAction,
  useRegisterBindings,
} from "@ensembleui/react-framework";
import { Form as AntForm } from "antd";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useState, useCallback, useEffect, useRef } from "react";
import dayjs from "dayjs";
import { isEmpty, isEqual } from "lodash-es";
import { WidgetRegistry } from "../../registry";
import type { EnsembleWidgetProps } from "../../shared/types";
import { useEnsembleAction } from "../../runtime/hooks/useEnsembleAction";
import type { FormInputProps } from "../Form/types";
import { DateDisplayFormat } from "../Date/utils/DateConstants";
import { DatePickerContext } from "../Date/utils/DatePickerContext";
import { isDateValid } from "../Date/utils/isDateValid";
import { CalendarHeader } from "./CalendarHeader";
import { ActionBar } from "./ActionBar";

type DateProps = {
  initialValue?: string;
  firstDate?: string;
  lastDate?: string;
  showCalendarIcon?: boolean;
  onChange?: EnsembleAction;
} & EnsembleWidgetProps &
  FormInputProps<string>;

export const DateRange: React.FC<DateProps> = (props) => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [value, setValue] = useState<dayjs.Dayjs | string | undefined>("");
  const [openPicker, setOpenPicker] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [enteredDate, setEnteredDate] = useState("Start Date - End Date");
  const [errorText, setErrorText] = useState("");
  const [endDateErrorText, setEndDateErrorText] = useState("");
  const [calendarMonth, setCalendarMonth] = useState<number>(
    getCalendarMonth(),
  );
  const datePickerRef = useRef<HTMLDivElement | null>(null);
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
    if (!isCalendarOpen || !openPicker) {
      return;
    }

    const formattedDate = dayjs(date as string).format(DateDisplayFormat);
    if (formattedDate !== "Invalid Date") {
      if (
        isEmpty(startDate) ||
        (!isEmpty(startDate) && !isEmpty(endDate)) ||
        dayjs(date as string).isBefore(dayjs(startDate))
      ) {
        setStartDate(formattedDate);
        setEndDate("");
        setEnteredDate(`${formattedDate} - End Date`);
      } else {
        setEndDate(formattedDate);
        setEnteredDate(`${startDate} - ${formattedDate}`);
        onChangeCallback(formattedDate);
      }
    }
  };

  const onDateClear = (): void => {
    setValue(undefined);
    setStartDate("");
    setEndDate("");
    setEnteredDate("Start Date - End Date");
  };

  useEffect(() => {
    if (!isDateValid(startDate) && !isDateValid(endDate)) {
      return;
    }

    const startDay = parseInt(startDate.substring(3, 5));
    const endDay = parseInt(endDate.substring(3, 5));
    const startMonth = parseInt(startDate.substring(0, 2));
    const endMonth = parseInt(endDate.substring(0, 2));
    const startYear = parseInt(startDate.substring(6, 10));
    const endYear = parseInt(endDate.substring(6, 10));

    const calendarYear = getCalendarYear();
    const newCalendarMonth = getCalendarMonth();
    setCalendarMonth(newCalendarMonth);

    datePickerRef?.current
      ?.querySelectorAll(".MuiPickersDay-root")
      ?.forEach((button) => {
        const buttonDay = parseInt(button.textContent?.trim() || "");

        if (
          (isEqual(startMonth, newCalendarMonth) &&
            isEqual(buttonDay, startDay) &&
            isEqual(startYear, calendarYear)) ||
          (isEqual(endMonth, newCalendarMonth) &&
            isEqual(buttonDay, endDay) &&
            isEqual(endYear, calendarYear))
        ) {
          button.classList.add("CustomSelected");
        } else {
          button.classList.remove("CustomSelected");
        }

        if (
          (startYear < calendarYear ||
            (isEqual(startYear, calendarYear) &&
              startMonth < newCalendarMonth) ||
            (isEqual(startYear, calendarYear) &&
              isEqual(startMonth, newCalendarMonth) &&
              buttonDay > startDay)) &&
          (endYear > calendarYear ||
            (isEqual(endYear, calendarYear) && endMonth > newCalendarMonth) ||
            (isEqual(endYear, calendarYear) &&
              isEqual(endMonth, newCalendarMonth) &&
              buttonDay < endDay))
        ) {
          button.classList.add("CustomInRange");
        } else {
          button.classList.remove("CustomInRange");
        }
      });
  }, [startDate, endDate, calendarMonth, isCalendarOpen, openPicker]);

  return (
    <DatePickerContext.Provider
      value={{
        firstDate: props?.firstDate,
        lastDate: props?.lastDate,
        value,
        setValue,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        isCalendarOpen,
        setIsCalendarOpen,
        setOpenPicker,
        enteredDate,
        setEnteredDate,
        errorText,
        setErrorText,
        endDateErrorText,
        setEndDateErrorText,
      }}
    >
      <AntForm.Item
        label={values?.label}
        name={props.id ? values?.id : values?.label}
        rules={[{ required: values?.required }]}
        style={{
          margin: "0px",
          alignItems: "center",
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <style>{customDateRangeStyles}</style>
          <DatePicker
            label={value?.toString() || props?.hintText || "Select a date"}
            value={value}
            disabled={props?.enabled === false}
            closeOnSelect={false}
            open={openPicker}
            maxDate={props.lastDate ? dayjs(props.lastDate) : undefined}
            minDate={props.firstDate ? dayjs(props.firstDate) : undefined}
            onClose={(): void => setOpenPicker(false)}
            onChange={onDateChange}
            onMonthChange={(date: unknown): void =>
              setCalendarMonth(dayjs(date as string | dayjs.Dayjs).month() + 1)
            }
            slots={{
              calendarHeader: CalendarHeader,
              actionBar: isCalendarOpen ? undefined : ActionBar,
            }}
            slotProps={{
              actionBar: isCalendarOpen
                ? undefined
                : {
                    actions: ["cancel", "accept"],
                  },
              field: {
                clearable: Boolean(value),
                onClear: onDateClear,
              },
              textField: {
                InputLabelProps: {
                  shrink: false,
                  sx: !isEmpty(value)
                    ? {
                        color: "black !important",
                        fontSize: "16px !important",
                      }
                    : undefined,
                },
                onClick:
                  props?.enabled === false
                    ? undefined
                    : (): void => setOpenPicker(true),
                error: false,
                color: "success",
                variant: "outlined",
              },
              popper: {
                ref: datePickerRef,
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
                  "& .Mui-selected": {
                    backgroundColor: "transparent",
                    color: "rgba(0, 0, 0, 0.87)",
                  },
                },
              },
            }}
            sx={{
              "& .MuiInputBase-input.MuiOutlinedInput-input.MuiInputBase-inputAdornedEnd":
                {
                  visibility: "hidden !important",
                },
              "& .MuiDateCalendar-root": {
                backgroundColor: "rgb(239, 223, 240)",
                overflow: "visible !important",
                height: "unset !important",
                maxHeight: "unset !important",
              },
            }}
          />
        </LocalizationProvider>
      </AntForm.Item>
    </DatePickerContext.Provider>
  );
};

WidgetRegistry.register("DateRange", DateRange);

const customDateRangeStyles = `
  .CustomSelected {
    background-color: rgb(81, 177, 145) !important;
    color: white !important;
  }
  .CustomInRange {
    background-color: rgb(208, 229, 253) !important;
  }
`;

const getCalendarMonth = (): number =>
  parseInt(
    new Date(
      `${
        document
          .querySelector(".MuiPickersCalendarHeader-label")
          ?.textContent?.split(" ")[0]
          .trim() || ""
      } 01 2000`,
    ).toLocaleDateString(`en`, {
      month: `2-digit`,
    }),
  );

const getCalendarYear = (): number =>
  parseInt(
    document
      .querySelector(".MuiPickersCalendarHeader-label")
      ?.textContent?.split(" ")[1]
      .trim() || "",
  );
