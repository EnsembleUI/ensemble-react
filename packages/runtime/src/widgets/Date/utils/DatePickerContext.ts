import { createContext } from "react";
import type dayjs from "dayjs";

export interface DatePickerProps {
  firstDate?: string;
  lastDate?: string;
  value?: dayjs.Dayjs | string | undefined;
  setValue?: (value: dayjs.Dayjs | string | undefined) => void;
  startDate?: string;
  setStartDate?: (value: string) => void;
  endDate?: string;
  setEndDate?: (value: string) => void;
  setOpenPicker?: (value: boolean) => void;
  isCalendarOpen?: boolean;
  setIsCalendarOpen?: (value: boolean) => void;
  enteredDate?: string;
  setEnteredDate?: (value: string) => void;
  errorText?: string;
  setErrorText?: (value: string) => void;
  endDateErrorText?: string;
  setEndDateErrorText?: (value: string) => void;
}

export const DatePickerContext = createContext<DatePickerProps | undefined>(
  undefined,
);
