import {
  type EnsembleAction,
  useRegisterBindings,
} from "@ensembleui/react-framework";
import { Form as AntForm, Typography } from "antd";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useState, createContext, useContext, useCallback } from "react";
import {
  PickersCalendarHeader,
  type PickersCalendarHeaderProps,
} from "@mui/x-date-pickers/PickersCalendarHeader";
import {
  PickersActionBar,
  type PickersActionBarProps,
} from "@mui/x-date-pickers/PickersActionBar";
import { Button, IconButton, TextField } from "@mui/material";
import dayjs from "dayjs";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { Edit } from "@mui/icons-material";
import { toString } from "lodash";
import { WidgetRegistry } from "../registry";
import type { EnsembleWidgetProps } from "../shared/types";
import { useEnsembleAction } from "../runtime/hooks/useEnsembleAction";
import type { FormInputProps } from "./Form/types";

const DateHeaderFormat = "ddd, MMM DD";
const DateDisplayFormat = "MM/DD/YYYY";

type DateProps = {
  initialValue?: string;
  firstDate?: string;
  lastDate?: string;
  showCalendarIcon?: boolean;
  onChange?: EnsembleAction;
} & EnsembleWidgetProps &
  FormInputProps<string>;

interface DatePickerProps {
  firstDate?: string;
  lastDate?: string;
  value?: dayjs.Dayjs | undefined;
  setValue?: (value: dayjs.Dayjs | undefined) => void;
  isCalendarOpen?: boolean;
  setIsCalendarOpen?: (value: boolean) => void;
  enteredDate?: string;
  setEnteredDate?: (value: string) => void;
  errorText?: string;
  setErrorText?: (value: string) => void;
}

export const DatePickerContext = createContext<DatePickerProps | undefined>(
  undefined,
);

export const Date: React.FC<DateProps> = (props) => {
  const [value, setValue] = useState<dayjs.Dayjs | undefined>(
    props.initialValue ? dayjs(props.initialValue) : undefined,
  );
  const [openPicker, setOpenPicker] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [enteredDate, setEnteredDate] = useState("");
  const [errorText, setErrorText] = useState("");

  const { values } = useRegisterBindings({ ...props, value }, props.id, {
    setValue,
  });

  const action = useEnsembleAction(props.onChange);
  const onChangeCallback = useCallback(
    (date: any) => {
      const formattedDate = dayjs(toString(date))?.format(DateDisplayFormat);
      formattedDate !== "Invalid Date" && setEnteredDate(formattedDate);

      if (!action) {
        return;
      }
      action.callback({
        [props?.id as string]: {
          value: formattedDate,
          setValue,
          ...props,
        },
      });
    },
    [action, props],
  );

  const onDateAccept = (date: any): void => {
    setValue(dayjs(toString(date)));
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
          margin: "0px",
          alignItems: "center",
        }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label={value ? "" : props?.hintText || "Select a date"}
            value={value ? dayjs(value) : ""}
            closeOnSelect={false}
            open={openPicker}
            maxDate={props.lastDate ? dayjs(props.lastDate) : undefined}
            minDate={props.firstDate ? dayjs(props.firstDate) : undefined}
            onClose={(): void => setOpenPicker(false)}
            onAccept={onDateAccept}
            onChange={onChangeCallback}
            slots={{
              calendarHeader: CustomCalendarHeader,
              actionBar: CustomActionBar,
            }}
            slotProps={{
              calendarHeader: {
                labelId: value?.format(DateHeaderFormat),
              },
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
                onClick: () => setOpenPicker(true),
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

const CustomCalendarHeader: React.FC<PickersCalendarHeaderProps<any>> = (
  props,
) => {
  const context = useContext(DatePickerContext);
  const [isCalendarOpen, setIsCalendarOpen] = useState(context?.isCalendarOpen);

  const toggleCalendar = (): void => {
    context?.setIsCalendarOpen!(!context?.isCalendarOpen);
    setIsCalendarOpen(!isCalendarOpen);
  };

  const onDateChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => context?.setEnteredDate?.(e.target.value);

  const getHeaderDate = (): string => {
    const enteredDate = dayjs(context?.enteredDate)?.format(DateHeaderFormat);

    return enteredDate === "Invalid Date"
      ? context?.value?.format(DateHeaderFormat) || ""
      : enteredDate;
  };

  return (
    <>
      <div
        style={{
          backgroundColor: "rgb(82, 178, 145)",
        }}
      >
        <h6
          style={{
            margin: "18px 0 18px 24px",
            color: "white",
          }}
        >
          SELECT DATE
        </h6>
        <Button
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "rgb(82, 178, 145)",
            borderColor: "rgb(82, 178, 145)",
            width: "calc(100% - 32px)",
            marginLeft: "16px",
          }}
        >
          <Typography.Text
            style={{
              color: "white",
              fontSize: "20px",
              fontWeight: "bold",
            }}
          >
            {getHeaderDate()}
          </Typography.Text>
          <IconButton onClick={toggleCalendar}>
            {isCalendarOpen ? (
              <Edit
                sx={{
                  color: "white",
                }}
              />
            ) : (
              <CalendarTodayIcon
                sx={{
                  color: "white",
                }}
              />
            )}
          </IconButton>
        </Button>
      </div>

      <div>
        {context?.isCalendarOpen ? (
          <PickersCalendarHeader
            {...props}
            sx={{
              ...props.sx,
              "& .MuiPickersCalendarHeader-root": {
                marginTop: "0px",
              },
            }}
          />
        ) : (
          <TextField
            value={context?.enteredDate}
            placeholder={DateDisplayFormat.toLowerCase()}
            InputLabelProps={{ shrink: true }}
            error={Boolean(context?.errorText) && context?.errorText !== ""}
            label="Enter Date"
            helperText={context?.errorText}
            variant="standard"
            onChange={onDateChange}
            sx={{
              margin: "24px",
            }}
          />
        )}
      </div>
    </>
  );
};

const CustomActionBar: React.FC<PickersActionBarProps> = (props) => {
  const context = useContext(DatePickerContext);

  const onSelectAction = (): void => {
    const dateToCheck = dayjs(context?.enteredDate);

    const isInvalidFormat = context?.isCalendarOpen
      ? false
      : dateToCheck.toString() === "Invalid Date" ||
        !isDateValid(context?.enteredDate);
    const isOutOfDateRange =
      (context?.firstDate &&
        dateToCheck?.isBefore(dayjs(context?.firstDate))) ||
      (context?.lastDate && dateToCheck?.isAfter(dayjs(context?.lastDate)));

    if (isOutOfDateRange || isInvalidFormat) {
      let errorMessage = "";

      if (isOutOfDateRange) errorMessage = "Out of range.";
      else if (isInvalidFormat) errorMessage = "Invalid format.";

      context?.setErrorText?.(errorMessage);
    } else {
      context?.setValue?.(dayjs(context?.enteredDate));
      context?.setErrorText?.("");
      props.onAccept();
    }
  };

  return (
    <PickersActionBar
      {...props}
      onAccept={onSelectAction}
      sx={{
        ...props.sx,
        "& .MuiPickersLayout-actionBar, .MuiButton-root": {
          color: "rgb(82, 178, 145)",
          fontSize: "12px",
        },
      }}
    />
  );
};

// returns true if date is in mm/dd/yyyy format
const isDateValid = (date?: string): boolean =>
  Boolean(date) &&
  /^(?:0[1-9]|1[0-2])\/(?:0[1-9]|[12][0-9]|3[01])\/\d{4}$/.test(date);
