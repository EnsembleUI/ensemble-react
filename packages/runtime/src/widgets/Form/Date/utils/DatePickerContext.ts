import { createContext } from "react";
import type dayjs from "dayjs";

export interface DatePickerProps {
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
  onChangeCallback?: (date?: string) => void;
}

export const DatePickerContext = createContext<DatePickerProps | undefined>(
  undefined,
);
