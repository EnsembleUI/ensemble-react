import {
  type PickersActionBarProps,
  PickersActionBar,
} from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useContext } from "react";
import { isDateValid } from "../Date/utils/isDateValid";
import { DatePickerContext } from "../Date/utils/DatePickerContext";
import { DateDisplayFormat } from "../Date/utils/DateConstants";

export const ActionBar: React.FC<PickersActionBarProps> = (props) => {
  const context = useContext(DatePickerContext);

  const onSelectAction = (): void => {
    const formattedStartDate = dayjs(context?.startDate)?.format(
      DateDisplayFormat,
    );
    const formattedEndDate = dayjs(context?.endDate)?.format(DateDisplayFormat);

    let isInvalidFormat = false;

    if (
      formattedStartDate === "Invalid Date" ||
      !isDateValid(formattedStartDate)
    ) {
      context?.setErrorText?.("Invalid format.");
      isInvalidFormat = true;
    } else context?.setErrorText?.("");

    if (formattedEndDate === "Invalid Date" || !isDateValid(formattedEndDate)) {
      context?.setEndDateErrorText?.("Invalid format.");
      isInvalidFormat = true;
    } else context?.setEndDateErrorText?.("");

    let isOutOfDateRange = false;

    if (!isInvalidFormat) {
      if (
        context?.firstDate &&
        (dayjs(context?.startDate).isBefore(dayjs(context?.firstDate)) ||
          dayjs(context?.startDate).isAfter(dayjs(context?.lastDate)))
      ) {
        context?.setErrorText?.("Out of range.");
        isOutOfDateRange = true;
      } else if (
        context?.lastDate &&
        (dayjs(context?.endDate).isBefore(dayjs(context?.firstDate)) ||
          dayjs(context?.endDate).isAfter(dayjs(context?.lastDate)))
      ) {
        context?.setEndDateErrorText?.("Out of range.");
        isOutOfDateRange = true;
      } else if (dayjs(context?.startDate).isAfter(dayjs(context?.endDate))) {
        context?.setErrorText?.("Invalid range.");
        isOutOfDateRange = true;
      } else {
        context?.setErrorText?.("");
        context?.setEndDateErrorText?.("");
      }
    }

    if (!isOutOfDateRange && !isInvalidFormat) {
      context?.setStartDate?.(formattedStartDate);
      context?.setEndDate?.(formattedEndDate);
      context?.setEnteredDate?.(`${formattedStartDate} - ${formattedEndDate}`);
      context?.setValue?.(`${formattedStartDate} - ${formattedEndDate}`);
      context?.setOpenPicker?.(false);
      props.onAccept();
    }
  };

  const onCancel = (): void => {
    context?.setStartDate?.("");
    context?.setEndDate?.("");
    context?.setEnteredDate?.("Start Date - End Date");
    context?.setErrorText?.("");
    context?.setEndDateErrorText?.("");
    context?.setOpenPicker?.(false);
    props.onCancel();
  };

  return (
    <PickersActionBar
      {...props}
      onAccept={onSelectAction}
      onCancel={onCancel}
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
