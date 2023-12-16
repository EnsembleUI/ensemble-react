import { Edit, CalendarToday, Close } from "@mui/icons-material";
import { IconButton, TextField } from "@mui/material";
import {
  type PickersCalendarHeaderProps,
  PickersCalendarHeader,
} from "@mui/x-date-pickers";
import { Button, Typography } from "antd";
import dayjs from "dayjs";
import { useContext } from "react";
import { DateDisplayFormat } from "../Date/utils/DateConstants";
import { DatePickerContext } from "../Date/utils/DatePickerContext";

export const CalendarHeader: React.FC<PickersCalendarHeaderProps<unknown>> = (
  props,
) => {
  const context = useContext(DatePickerContext);

  const handleClose = (): void => context?.setOpenPicker?.(false);

  const toggleCalendar = (): void => {
    context?.setIsCalendarOpen?.(!context?.isCalendarOpen);
  };

  const onDateChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    isStartDate?: boolean,
  ): void => {
    if (isStartDate) {
      context?.setStartDate?.(e.target.value);
    } else {
      context?.setEndDate?.(e.target.value);
    }
  };

  const onSaveClick = (): void => {
    const formattedStartDate = dayjs(context?.startDate)?.format(
      DateDisplayFormat,
    );
    const formattedEndDate = dayjs(context?.endDate)?.format(DateDisplayFormat);
    context?.setValue?.(`${formattedStartDate} - ${formattedEndDate}`);
    handleClose();
  };

  return (
    <>
      {context?.isCalendarOpen && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "5px",
          }}
        >
          <IconButton onClick={handleClose}>
            <Close
              sx={{
                color: "black",
              }}
            />
          </IconButton>
          <Button
            onClick={onSaveClick}
            style={{
              backgroundColor: "rgb(239, 223, 240)",
              borderColor: "rgb(239, 223, 240)",
            }}
            disabled={context?.startDate === "" || context?.endDate === ""}
          >
            Save
          </Button>
        </div>
      )}

      <div>
        <h5
          style={{
            margin: "18px 0 8px 24px",
          }}
        >
          Select range
        </h5>
        <Button
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            backgroundColor: "rgb(239, 223, 240)",
            borderColor: "rgb(239, 223, 240)",
            borderRadius: "0px",
            borderBottomColor: "black",
            marginTop: "40px",
            paddingBottom: "20px",
          }}
        >
          <Typography.Text
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              marginLeft: "8px",
            }}
          >
            {context?.enteredDate}
          </Typography.Text>
          <IconButton onClick={toggleCalendar}>
            {context?.isCalendarOpen ? (
              <Edit
                sx={{
                  color: " black",
                }}
              />
            ) : (
              <CalendarToday
                sx={{
                  color: "black",
                }}
              />
            )}
          </IconButton>
        </Button>
      </div>

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
        <div
          style={{
            display: "flex",
            margin: "24px",
            gap: "10px",
          }}
        >
          <TextField
            value={context?.startDate}
            placeholder={DateDisplayFormat.toLowerCase()}
            error={Boolean(context?.errorText)}
            helperText={context?.errorText}
            onChange={(e): void => onDateChange(e, true)}
            label="Start Date"
            variant="outlined"
            color="success"
          />
          <TextField
            value={context?.endDate}
            placeholder={DateDisplayFormat.toLowerCase()}
            error={Boolean(context?.endDateErrorText)}
            helperText={context?.endDateErrorText}
            onChange={(e): void => onDateChange(e, false)}
            label="End Date"
            variant="outlined"
            color="success"
          />
        </div>
      )}
    </>
  );
};
