import { PickersActionBarProps, PickersActionBar } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useContext } from "react";
import { isDateValid } from "./utils/isDateValid";
import { DatePickerContext } from "./utils/DatePickerContext";

export const ActionBar: React.FC<PickersActionBarProps> = (props) => {
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
      context?.onChangeCallback?.(context?.enteredDate);
      context?.setIsCalendarOpen?.(false);
      props.onAccept();
    }
  };

  return (
    <PickersActionBar
      {...props}
      onAccept={onSelectAction}
      sx={{
        ...props.sx,
        backgroundColor: "rgb(239, 223, 240)",
        "& .MuiPickersLayout-actionBar, .MuiButton-root": {
          color: "rgb(82, 178, 145)",
          fontSize: "12px",
        },
      }}
    />
  );
};
